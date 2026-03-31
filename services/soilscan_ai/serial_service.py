import serial
import serial.tools.list_ports
import time
import re
import threading
import os
import logging

logger = logging.getLogger(__name__)

class SerialMoistureService:
    """Service to handle serial communication with the Arduino Soil Sensor."""
    
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SerialMoistureService, cls).__new__(cls)
                cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.port = os.getenv("ARDUINO_PORT", None)
        self.baudrate = 9600
        self.timeout = 2
        self._initialized = True

    def _find_arduino_port(self):
        """Auto-detect the Arduino port if not explicitly set."""
        if self.port:
            return self.port
        
        ports = list(serial.tools.list_ports.comports())
        for p in ports:
            # Look for common Arduino/Nano markers
            desc = p.description.lower()
            if any(marker in desc for marker in ["arduino", "ch340", "usb serial", "usb-to-serial"]):
                logger.info(f"Auto-detected Arduino on port: {p.device} ({p.description})")
                return p.device
        return None

    def get_moisture(self) -> float | None:
        """Reads a single moisture reading from the serial port."""
        port = self._find_arduino_port()
        if not port:
            logger.warning("No Arduino port detected.")
            return None
        
        try:
            # We open and close the port for each reading to avoid 
            # blocking other processes and to handle reconnections easily.
            with serial.Serial(port, self.baudrate, timeout=self.timeout) as ser:
                # Flush to get fresh data
                ser.reset_input_buffer()
                time.sleep(0.1) 
                
                # Try reading a few lines to find the correct format
                for _ in range(10):
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    if not line:
                        continue
                        
                    # Looking for "Soil Moisture: X%" or just "X%"
                    match = re.search(r"Soil Moisture:\s*(\d+)%", line)
                    if not match:
                        match = re.search(r"Current Reading:\s*(\d+)%", line) # Added this
                    if not match:
                        match = re.search(r"(\d+)%", line) # Fallback
                        
                    if match:
                        val = float(match.group(1))
                        logger.info(f"Read moisture from {port}: {val}%")
                        return val
                        
        except Exception as e:
            logger.error(f"Failed to read from serial port {port}: {e}")
            return None
            
        return None

# Singleton instance
serial_service = SerialMoistureService()
