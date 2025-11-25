from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class QuantumSettings(BaseSettings):
    """
    Configuration for Quantum Computing Backends.
    """
    # IBM Quantum
    IBMQ_API_TOKEN: Optional[str] = None
    IBMQ_HUB: str = "ibm-q"
    IBMQ_GROUP: str = "open"
    IBMQ_PROJECT: str = "main"
    
    # D-Wave
    DWAVE_API_TOKEN: Optional[str] = None
    DWAVE_SOLVER: str = "Advantage_system4.1"
    
    # Simulation
    USE_SIMULATOR: bool = True
    SIMULATOR_BACKEND: str = "aer_simulator"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="QUANTUM_",
        extra="ignore"
    )

quantum_settings = QuantumSettings()
