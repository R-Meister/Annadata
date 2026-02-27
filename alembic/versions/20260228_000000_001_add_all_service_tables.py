"""Add all service tables for Phase 1 DB persistence

Revision ID: 001
Revises: None
Create Date: 2026-02-28

Creates tables for all 11 microservices:
- price_alerts (MSP Mitra)
- soil_analyses (SoilScan AI)
- disease_detections (Fasal Rakshak)
- irrigation_plots, irrigation_events, valve_states (Jal Shakti)
- harvest_plots (Harvest Shakti)
- chat_sessions, chat_messages, farmer_interactions (Kisaan Sahayak)
- credit_scores (Kisan Credit)
- connection_logs, route_logs (Harvest-to-Cart)
- seed_batches, seed_verifications, community_reports (Beej Suraksha)
- weather_stations, forecast_stats (Mausam Chakra)
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ----------------------------------------------------------------
    # MSP Mitra — price_alerts
    # ----------------------------------------------------------------
    op.create_table(
        "price_alerts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("alert_id", sa.String(50), nullable=False),
        sa.Column("commodity", sa.String(100), nullable=False),
        sa.Column("state", sa.String(100), nullable=False),
        sa.Column("target_price", sa.Float(), nullable=False),
        sa.Column("direction", sa.String(10), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("trigger_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("alert_id"),
    )
    op.create_index("ix_price_alerts_alert_id", "price_alerts", ["alert_id"])
    op.create_index("ix_price_alerts_commodity", "price_alerts", ["commodity"])
    op.create_index("ix_price_alerts_state", "price_alerts", ["state"])

    # ----------------------------------------------------------------
    # SoilScan AI — soil_analyses
    # ----------------------------------------------------------------
    op.create_table(
        "soil_analyses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("analysis_id", sa.String(100), nullable=False),
        sa.Column("plot_id", sa.String(100), nullable=False),
        sa.Column(
            "source", sa.String(30), nullable=False, server_default="sensor_analysis"
        ),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("soil_type", sa.String(50), nullable=True),
        sa.Column("temperature_celsius", sa.Float(), nullable=True),
        # Sensor raw readings
        sa.Column("nitrogen_ppm", sa.Float(), nullable=True),
        sa.Column("phosphorus_ppm", sa.Float(), nullable=True),
        sa.Column("potassium_ppm", sa.Float(), nullable=True),
        sa.Column("ph_level", sa.Float(), nullable=True),
        sa.Column("organic_carbon_pct", sa.Float(), nullable=True),
        sa.Column("moisture_pct", sa.Float(), nullable=True),
        # Photo predicted readings
        sa.Column("predicted_ph", sa.Float(), nullable=True),
        sa.Column("predicted_nitrogen_ppm", sa.Float(), nullable=True),
        sa.Column("predicted_phosphorus_ppm", sa.Float(), nullable=True),
        sa.Column("predicted_potassium_ppm", sa.Float(), nullable=True),
        sa.Column("predicted_organic_carbon_pct", sa.Float(), nullable=True),
        sa.Column("predicted_moisture_pct", sa.Float(), nullable=True),
        sa.Column("region", sa.String(100), nullable=True),
        sa.Column("image_features", postgresql.JSON(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        # Scores
        sa.Column("ph_score", sa.Float(), nullable=False),
        sa.Column("nitrogen_score", sa.Float(), nullable=False),
        sa.Column("phosphorus_score", sa.Float(), nullable=False),
        sa.Column("potassium_score", sa.Float(), nullable=False),
        sa.Column("organic_carbon_score", sa.Float(), nullable=False),
        sa.Column("moisture_score", sa.Float(), nullable=False),
        sa.Column("health_score", sa.Float(), nullable=False),
        sa.Column("fertility_class", sa.String(20), nullable=False),
        sa.Column("recommendations", postgresql.JSON(), nullable=False),
        sa.Column("analyzed_at", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("analysis_id"),
    )
    op.create_index("ix_soil_analyses_analysis_id", "soil_analyses", ["analysis_id"])
    op.create_index("ix_soil_analyses_plot_id", "soil_analyses", ["plot_id"])

    # ----------------------------------------------------------------
    # Fasal Rakshak — disease_detections
    # ----------------------------------------------------------------
    op.create_table(
        "disease_detections",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("detection_id", sa.String(100), nullable=False),
        sa.Column("crop", sa.String(100), nullable=False),
        sa.Column("top_disease", sa.String(200), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("detected_at", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("detection_id"),
    )
    op.create_index(
        "ix_disease_detections_detection_id", "disease_detections", ["detection_id"]
    )
    op.create_index("ix_disease_detections_crop", "disease_detections", ["crop"])

    # ----------------------------------------------------------------
    # Jal Shakti — irrigation_plots
    # ----------------------------------------------------------------
    op.create_table(
        "irrigation_plots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("plot_id", sa.String(100), nullable=False),
        sa.Column("farm_id", sa.String(100), nullable=False),
        sa.Column("crop", sa.String(100), nullable=False),
        sa.Column("area_hectares", sa.Float(), nullable=False),
        sa.Column("soil_type", sa.String(50), nullable=False, server_default="loam"),
        sa.Column(
            "irrigation_method", sa.String(50), nullable=False, server_default="flood"
        ),
        sa.Column(
            "current_moisture_pct", sa.Float(), nullable=False, server_default="25.0"
        ),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("irrigation_active", sa.Boolean(), server_default="false"),
        sa.Column(
            "registered_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("plot_id"),
    )
    op.create_index("ix_irrigation_plots_plot_id", "irrigation_plots", ["plot_id"])
    op.create_index("ix_irrigation_plots_farm_id", "irrigation_plots", ["farm_id"])

    # ----------------------------------------------------------------
    # Jal Shakti — irrigation_events
    # ----------------------------------------------------------------
    op.create_table(
        "irrigation_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("plot_id", sa.String(100), nullable=False),
        sa.Column("farm_id", sa.String(100), nullable=False),
        sa.Column("crop", sa.String(100), nullable=False),
        sa.Column("area_hectares", sa.Float(), nullable=False),
        sa.Column("date", sa.String(20), nullable=False),
        sa.Column("water_liters", sa.Float(), nullable=False),
        sa.Column("water_mm", sa.Float(), nullable=False),
        sa.Column("method", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_irrigation_events_plot_id", "irrigation_events", ["plot_id"])
    op.create_index("ix_irrigation_events_farm_id", "irrigation_events", ["farm_id"])
    op.create_index("ix_irrigation_events_date", "irrigation_events", ["date"])

    # ----------------------------------------------------------------
    # Jal Shakti — valve_states
    # ----------------------------------------------------------------
    op.create_table(
        "valve_states",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("plot_id", sa.String(100), nullable=False),
        sa.Column("valve_status", sa.String(20), nullable=False),
        sa.Column("flow_rate_pct", sa.Float(), nullable=False),
        sa.Column("battery_level_pct", sa.Float(), nullable=False),
        sa.Column("solar_charge_watts", sa.Float(), nullable=False),
        sa.Column("last_action", sa.String(20), nullable=False),
        sa.Column("last_action_timestamp", sa.String(50), nullable=False),
        sa.Column("auto_decision_reason", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("plot_id"),
    )
    op.create_index("ix_valve_states_plot_id", "valve_states", ["plot_id"])

    # ----------------------------------------------------------------
    # Harvest Shakti — harvest_plots
    # ----------------------------------------------------------------
    op.create_table(
        "harvest_plots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("plot_id", sa.String(100), nullable=False),
        sa.Column("crop", sa.String(100), nullable=False),
        sa.Column("variety", sa.String(100), nullable=True, server_default=""),
        sa.Column("area_hectares", sa.Float(), nullable=False),
        sa.Column("sowing_date", sa.Date(), nullable=False),
        sa.Column(
            "soil_health_score", sa.Float(), nullable=False, server_default="75.0"
        ),
        sa.Column(
            "irrigation_type", sa.String(50), nullable=False, server_default="flood"
        ),
        sa.Column("region", sa.String(100), nullable=True, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("plot_id"),
    )
    op.create_index("ix_harvest_plots_plot_id", "harvest_plots", ["plot_id"])

    # ----------------------------------------------------------------
    # Kisaan Sahayak — chat_sessions
    # ----------------------------------------------------------------
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_id", sa.String(100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id"),
    )
    op.create_index("ix_chat_sessions_session_id", "chat_sessions", ["session_id"])

    # ----------------------------------------------------------------
    # Kisaan Sahayak — chat_messages
    # ----------------------------------------------------------------
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_id", sa.String(100), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["chat_sessions.session_id"],
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])

    # ----------------------------------------------------------------
    # Kisaan Sahayak — farmer_interactions
    # ----------------------------------------------------------------
    op.create_table(
        "farmer_interactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("farmer_id", sa.String(100), nullable=False),
        sa.Column("interaction_id", sa.String(100), nullable=False),
        sa.Column("interaction_type", sa.String(100), nullable=False),
        sa.Column("crop_type", sa.String(100), nullable=True),
        sa.Column("disease_detected", sa.String(200), nullable=True),
        sa.Column("severity", sa.String(50), nullable=True),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("timestamp", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("interaction_id"),
    )
    op.create_index(
        "ix_farmer_interactions_farmer_id", "farmer_interactions", ["farmer_id"]
    )
    op.create_index(
        "ix_farmer_interactions_interaction_id",
        "farmer_interactions",
        ["interaction_id"],
    )

    # ----------------------------------------------------------------
    # Kisan Credit — credit_scores
    # ----------------------------------------------------------------
    op.create_table(
        "credit_scores",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("score_id", sa.String(100), nullable=False),
        sa.Column("farmer_id", sa.String(100), nullable=False),
        sa.Column("credit_score", sa.Float(), nullable=False),
        sa.Column("grade", sa.String(5), nullable=False),
        sa.Column("components", postgresql.JSON(), nullable=False),
        sa.Column("loan_eligibility", sa.Boolean(), nullable=False),
        sa.Column("max_loan_amount", sa.Float(), nullable=False),
        sa.Column("interest_rate_suggestion", sa.Float(), nullable=False),
        sa.Column("region", sa.String(100), nullable=True),
        sa.Column("land_area_hectares", sa.Float(), nullable=True),
        sa.Column("crop_types", postgresql.JSON(), nullable=False),
        sa.Column("years_farming", sa.Integer(), nullable=True),
        sa.Column("calculated_at", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("score_id"),
    )
    op.create_index("ix_credit_scores_score_id", "credit_scores", ["score_id"])
    op.create_index("ix_credit_scores_farmer_id", "credit_scores", ["farmer_id"])

    # ----------------------------------------------------------------
    # Harvest-to-Cart — connection_logs
    # ----------------------------------------------------------------
    op.create_table(
        "connection_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("timestamp", sa.String(50), nullable=False),
        sa.Column("farmer_id", sa.String(100), nullable=False),
        sa.Column("crop", sa.String(100), nullable=False),
        sa.Column("quantity_tonnes", sa.Float(), nullable=False),
        sa.Column("matches", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_connection_logs_farmer_id", "connection_logs", ["farmer_id"])

    # ----------------------------------------------------------------
    # Harvest-to-Cart — route_logs
    # ----------------------------------------------------------------
    op.create_table(
        "route_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("timestamp", sa.String(50), nullable=False),
        sa.Column("total_distance_km", sa.Float(), nullable=False),
        sa.Column("tonnes", sa.Float(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # ----------------------------------------------------------------
    # Beej Suraksha — seed_batches
    # ----------------------------------------------------------------
    op.create_table(
        "seed_batches",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("qr_code_id", sa.String(100), nullable=False),
        sa.Column("manufacturer", sa.String(200), nullable=False),
        sa.Column(
            "manufacturer_verified",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
        sa.Column("seed_variety", sa.String(200), nullable=False),
        sa.Column("crop_type", sa.String(100), nullable=False),
        sa.Column("batch_number", sa.String(100), nullable=False),
        sa.Column("manufacture_date", sa.String(20), nullable=False),
        sa.Column("expiry_date", sa.String(20), nullable=False),
        sa.Column("quantity_kg", sa.Float(), nullable=False),
        sa.Column("certification_id", sa.String(200), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("supply_chain", postgresql.JSON(), nullable=False),
        sa.Column("blockchain", postgresql.JSON(), nullable=True),
        sa.Column(
            "registered_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("qr_code_id"),
    )
    op.create_index("ix_seed_batches_qr_code_id", "seed_batches", ["qr_code_id"])
    op.create_index("ix_seed_batches_manufacturer", "seed_batches", ["manufacturer"])

    # ----------------------------------------------------------------
    # Beej Suraksha — seed_verifications
    # ----------------------------------------------------------------
    op.create_table(
        "seed_verifications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("verification_id", sa.String(100), nullable=False),
        sa.Column("qr_code_id", sa.String(100), nullable=False),
        sa.Column("result", sa.String(20), nullable=False),
        sa.Column("warnings", postgresql.JSON(), nullable=True),
        sa.Column("timestamp", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("verification_id"),
    )
    op.create_index(
        "ix_seed_verifications_verification_id",
        "seed_verifications",
        ["verification_id"],
    )
    op.create_index(
        "ix_seed_verifications_qr_code_id", "seed_verifications", ["qr_code_id"]
    )

    # ----------------------------------------------------------------
    # Beej Suraksha — community_reports
    # ----------------------------------------------------------------
    op.create_table(
        "community_reports",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("report_id", sa.String(100), nullable=False),
        sa.Column("reporter_id", sa.String(100), nullable=False),
        sa.Column("qr_code_id", sa.String(100), nullable=True),
        sa.Column("dealer_name", sa.String(200), nullable=False),
        sa.Column("location", postgresql.JSON(), nullable=False),
        sa.Column("issue_type", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("affected_area_hectares", sa.Float(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="submitted"),
        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("report_id"),
    )
    op.create_index(
        "ix_community_reports_report_id", "community_reports", ["report_id"]
    )
    op.create_index(
        "ix_community_reports_reporter_id", "community_reports", ["reporter_id"]
    )
    op.create_index(
        "ix_community_reports_qr_code_id", "community_reports", ["qr_code_id"]
    )
    op.create_index(
        "ix_community_reports_dealer_name", "community_reports", ["dealer_name"]
    )

    # ----------------------------------------------------------------
    # Mausam Chakra — weather_stations
    # ----------------------------------------------------------------
    op.create_table(
        "weather_stations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("station_id", sa.String(100), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("last_reading_time", sa.String(50), nullable=True),
        sa.Column("last_ingested_at", sa.String(50), nullable=True),
        sa.Column("readings", postgresql.JSON(), nullable=True),
        sa.Column("quality_flags", postgresql.JSON(), nullable=True),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("district", sa.String(100), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("station_id"),
    )
    op.create_index(
        "ix_weather_stations_station_id", "weather_stations", ["station_id"]
    )

    # ----------------------------------------------------------------
    # Mausam Chakra — forecast_stats (singleton row)
    # ----------------------------------------------------------------
    op.create_table(
        "forecast_stats",
        sa.Column("id", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "total_forecasts_generated",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # Insert the singleton row
    op.execute(
        "INSERT INTO forecast_stats (id, total_forecasts_generated) VALUES (1, 0)"
    )


def downgrade() -> None:
    op.drop_table("forecast_stats")
    op.drop_table("weather_stations")
    op.drop_table("community_reports")
    op.drop_table("seed_verifications")
    op.drop_table("seed_batches")
    op.drop_table("route_logs")
    op.drop_table("connection_logs")
    op.drop_table("credit_scores")
    op.drop_table("farmer_interactions")
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
    op.drop_table("harvest_plots")
    op.drop_table("valve_states")
    op.drop_table("irrigation_events")
    op.drop_table("irrigation_plots")
    op.drop_table("disease_detections")
    op.drop_table("soil_analyses")
    op.drop_table("price_alerts")
