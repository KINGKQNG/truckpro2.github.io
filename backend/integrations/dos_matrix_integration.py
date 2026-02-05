import socket
import struct
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class DOSMatrixIntegration:
    """Integration with legacy DOS-based matrix system using socket communication"""
    
    def __init__(self, config: Dict[str, Any]):
        self.host = config.get("endpoint_url", "localhost").replace("http://", "").replace("https://", "")
        self.port = int(config.get("connection_params", {}).get("port", 5000))
        self.timeout = 10
        
    def test_connection(self) -> bool:
        """Test connection to DOS Matrix system"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(self.timeout)
                sock.connect((self.host, self.port))
                # Send handshake
                sock.sendall(b"PING\n")
                response = sock.recv(1024)
                return b"PONG" in response
        except Exception as e:
            logger.error(f"DOS Matrix connection test failed: {str(e)}")
            return False
    
    def send_command(self, command: str) -> str:
        """Send command to DOS Matrix system"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(self.timeout)
                sock.connect((self.host, self.port))
                
                # DOS Matrix uses fixed-width formatted commands
                formatted_cmd = command.ljust(80)[:80] + "\n"
                sock.sendall(formatted_cmd.encode('ascii'))
                
                # Read response
                response = sock.recv(4096).decode('ascii').strip()
                return response
        except Exception as e:
            logger.error(f"DOS Matrix command failed: {str(e)}")
            return ""
    
    def get_part_info(self, part_number: str) -> Dict:
        """Query part information from DOS Matrix"""
        try:
            # DOS Matrix command format: QUERY PART <part_number>
            command = f"QUERY PART {part_number}"
            response = self.send_command(command)
            
            if not response or response.startswith("ERROR"):
                return {}
            
            # Parse fixed-width response
            # Format: PART_NUM(15) | DESC(40) | QTY(8) | PRICE(10)
            if len(response) >= 73:
                return {
                    "part_number": response[0:15].strip(),
                    "description": response[16:56].strip(),
                    "quantity": int(response[57:65].strip() or 0),
                    "price": float(response[66:76].strip() or 0)
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to get part info: {str(e)}")
            return {}
    
    def update_inventory(self, part_number: str, quantity: int) -> bool:
        """Update inventory in DOS Matrix"""
        try:
            # DOS Matrix command format: UPDATE PART <part_number> QTY <quantity>
            command = f"UPDATE PART {part_number} QTY {quantity}"
            response = self.send_command(command)
            return "SUCCESS" in response
        except Exception as e:
            logger.error(f"Failed to update inventory: {str(e)}")
            return False
    
    def get_all_parts(self) -> List[Dict]:
        """Get all parts from DOS Matrix"""
        try:
            command = "LIST ALL PARTS"
            response = self.send_command(command)
            
            if not response or response.startswith("ERROR"):
                return []
            
            # Parse multiple lines of fixed-width data
            parts = []
            lines = response.split("\n")
            for line in lines[1:]:  # Skip header
                if len(line) >= 73:
                    parts.append({
                        "part_number": line[0:15].strip(),
                        "description": line[16:56].strip(),
                        "quantity": int(line[57:65].strip() or 0),
                        "price": float(line[66:76].strip() or 0)
                    })
            return parts
        except Exception as e:
            logger.error(f"Failed to get all parts: {str(e)}")
            return []
    
    def create_service_ticket(self, ticket_data: Dict) -> str:
        """Create service ticket in DOS Matrix"""
        try:
            # Format: CREATE TICKET <wo_num> <customer_id> <date>
            command = f"CREATE TICKET {ticket_data['work_order']} {ticket_data['customer_id']} {ticket_data['date']}"
            response = self.send_command(command)
            
            if "SUCCESS" in response:
                # Extract ticket number from response
                parts = response.split()
                if len(parts) >= 2:
                    return parts[1]  # Ticket number
            return ""
        except Exception as e:
            logger.error(f"Failed to create service ticket: {str(e)}")
            return ""
