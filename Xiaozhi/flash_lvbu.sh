#!/bin/bash
# Script để flash firmware cho LVBU ESP32 board

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== LVBU ESP32 Firmware Flash Script ===${NC}\n"

# Detect ESP32 port
detect_port() {
    # Try common ESP32 ports on macOS
    PORTS=(
        "/dev/cu.usbmodem*"
        "/dev/cu.SLAB_USBtoUART*"
        "/dev/cu.wchusbserial*"
        "/dev/cu.usbserial*"
    )
    
    for pattern in "${PORTS[@]}"; do
        for port in $pattern; do
            if [ -e "$port" ]; then
                echo "$port"
                return 0
            fi
        done
    done
    
    return 1
}

# Find ESP32 port
PORT=$(detect_port)

if [ -z "$PORT" ]; then
    echo -e "${RED}❌ Không tìm thấy ESP32 device!${NC}"
    echo "Hãy đảm bảo:"
    echo "  1. ESP32 đã được kết nối qua USB"
    echo "  2. USB cable hoạt động tốt"
    echo "  3. Driver USB-to-Serial đã được cài đặt (nếu cần)"
    echo ""
    echo "Các port hiện có:"
    ls -la /dev/cu.* 2>/dev/null || echo "  Không có port nào"
    exit 1
fi

echo -e "${GREEN}✓${NC} Tìm thấy ESP32 tại: ${YELLOW}$PORT${NC}\n"

# Check if ESP-IDF is set up
if ! command -v idf.py &> /dev/null; then
    echo -e "${RED}❌ ESP-IDF chưa được setup!${NC}"
    echo ""
    echo "Hãy setup ESP-IDF environment:"
    echo "  . \$HOME/esp/esp-idf/export.sh"
    echo ""
    echo "Hoặc nếu dùng VSCode/Cursor với ESP-IDF extension,"
    echo "mở terminal từ ESP-IDF extension."
    exit 1
fi

echo -e "${GREEN}✓${NC} ESP-IDF đã được setup\n"

# Check if we're in the right directory
if [ ! -f "main/CMakeLists.txt" ]; then
    echo -e "${RED}❌ Không tìm thấy project!${NC}"
    echo "Hãy chạy script này từ thư mục xiaozhi-esp32-main"
    exit 1
fi

# Set target if not already set
if [ ! -f "sdkconfig" ]; then
    echo -e "${YELLOW}⚠${NC}  Chưa có sdkconfig, đang set target esp32c3..."
    idf.py set-target esp32c3
fi

# Check if board type is configured
if ! grep -q "CONFIG_BOARD_TYPE_LVBU_ESP32=y" sdkconfig 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC}  Board type chưa được cấu hình!"
    echo "Hãy chạy: idf.py menuconfig"
    echo "Và chọn: Opensens Velo AI -> Board Type -> LVBU ESP32"
    read -p "Bạn có muốn mở menuconfig ngay bây giờ? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        idf.py menuconfig
    else
        echo "Hãy cấu hình board type trước khi flash!"
        exit 1
    fi
fi

# Build if needed
if [ ! -f "build/opensens-velo-esp32.bin" ] && [ ! -f "build/lvbu-esp32.bin" ]; then
    echo -e "${YELLOW}⚠${NC}  Chưa có firmware đã build, đang build..."
    idf.py build
fi

# Flash firmware
echo -e "\n${GREEN}=== Đang flash firmware... ===${NC}\n"
echo "Port: $PORT"
echo ""

# Try to flash
if idf.py -p "$PORT" flash; then
    echo -e "\n${GREEN}✓✓✓ Flash thành công! ✓✓✓${NC}\n"
    
    # Ask if user wants to monitor
    read -p "Bạn có muốn mở serial monitor để xem log? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "\n${GREEN}=== Serial Monitor (Nhấn Ctrl+] để thoát) ===${NC}\n"
        idf.py -p "$PORT" monitor
    fi
else
    echo -e "\n${RED}❌ Flash thất bại!${NC}"
    echo ""
    echo "Hãy thử:"
    echo "  1. Kiểm tra USB cable"
    echo "  2. Nhấn nút BOOT trên ESP32 và giữ, sau đó nhấn RESET, rồi thả BOOT"
    echo "  3. Thử lại: idf.py -p $PORT flash"
    exit 1
fi

