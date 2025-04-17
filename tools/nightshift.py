#!/usr/bin/env python3
"""
Night Shift Toggle - Direct Python implementation
A simple Python app to toggle macOS Night Shift feature using the nightlight CLI tool
"""

import sys
import os
import argparse
import platform
import subprocess
import shutil

class NightShiftController:
    """Controls Night Shift functionality on macOS using the nightlight CLI tool"""

    def __init__(self):
        # Check if running on macOS
        if platform.system() != "macOS" and platform.system() != "Darwin":
            print("This application only works on macOS")
            sys.exit(1)

        # Path to store warmth setting
        self.warmth_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "warmth")

        # Initialize warmth file if it doesn't exist
        if not os.path.exists(self.warmth_file):
            with open(self.warmth_file, "w") as f:
                f.write("50")

        # Find the path to the nightlight executable
        self.nightlight_path = self._find_nightlight()

    def _find_nightlight(self):
        """Find the path to the nightlight executable"""
        # Try to find nightlight in common locations
        possible_paths = [
            # Homebrew installation path
            "/opt/homebrew/bin/nightlight",
            "/usr/local/bin/nightlight",
            # Path if installed via Homebrew
            os.path.expanduser("~/homebrew/bin/nightlight"),
            # Custom path that might be in PATH
            shutil.which("nightlight")
        ]

        for path in possible_paths:
            if path and os.path.exists(path) and os.access(path, os.X_OK):
                return path

        return None

    def get_current_warmth(self):
        """Read the current warmth value from file"""
        try:
            with open(self.warmth_file, "r") as f:
                return int(f.read().strip())
        except (IOError, ValueError):
            # Default value if file can't be read
            return 0

    def save_warmth(self, value):
        """Save warmth value to file"""
        with open(self.warmth_file, "w") as f:
            f.write(str(value))

    def toggle_night_shift(self):
        """Toggle Night Shift on/off"""
        current = self.get_current_warmth()

        # If current warmth is greater than 0, turn off Night Shift
        # Otherwise, turn on Night Shift with the default 50% warmth
        new_warmth = 0 if current > 0 else 50

        # Save the new warmth setting
        self.save_warmth(new_warmth)

        # Apply the setting
        return self.set_night_shift(new_warmth)

    def set_night_shift(self, warmth):
        """Set Night Shift with specified warmth level"""
        if not self.nightlight_path:
            self._show_manual_instructions(warmth > 0)
            return False

        try:
            if warmth > 0:
                # Turn on Night Shift
                subprocess.run([self.nightlight_path, "on"], check=True)

                # Set temperature (1-100, where 1 is warmest and 100 is coolest)
                # Convert our 0-100 scale where 100 is warmest to nightlight's scale
                inverted_warmth = 100 - warmth
                # Ensure it's at least 1 since nightlight doesn't accept 0
                inverted_warmth = max(1, inverted_warmth)

                subprocess.run([
                    self.nightlight_path,
                    "temp",
                    str(inverted_warmth)
                ], check=True)

                return True
            else:
                # Turn off Night Shift
                subprocess.run([self.nightlight_path, "off"], check=True)
                return True
        except subprocess.SubprocessError as e:
            print(f"Error using nightlight tool: {e}")
            self._show_manual_instructions(warmth > 0)
            return False

    def _show_manual_instructions(self, turn_on=True):
        """Show instructions for manually toggling Night Shift"""
        print("\nAutomated Night Shift control failed.")
        print("To control Night Shift manually:")
        print("1. Click on Control Center in the menu bar (top-right)")
        print("2. Click on 'Display' or 'Night Shift'")
        print(f"3. {'Turn on' if turn_on else 'Turn off'} Night Shift")

        if not self.nightlight_path:
            print("\nTo enable automated control, install the nightlight tool:")
            print("brew install smudge/smudge/nightlight")


def main():
    """Main function to handle CLI arguments"""
    parser = argparse.ArgumentParser(description="Toggle or control macOS Night Shift")
    parser.add_argument("warmth", nargs="?", type=int, default=None,
                        help="Warmth value (0-100). 0 turns off Night Shift.")
    parser.add_argument("--status", action="store_true",
                        help="Show current Night Shift status")
    args = parser.parse_args()

    controller = NightShiftController()

    if args.status:
        if controller.nightlight_path:
            try:
                # Get current status
                result = subprocess.run(
                    [controller.nightlight_path, "status"],
                    capture_output=True,
                    text=True,
                    check=True
                )
                print(result.stdout)
            except subprocess.SubprocessError:
                print("Unable to get Night Shift status")
        else:
            print("Nightlight tool not found, can't check status")
        sys.exit(0)

    if args.warmth is not None:
        # Ensure warmth is within valid range
        warmth = max(0, min(100, args.warmth))
        success = controller.set_night_shift(warmth)
        if success:
            controller.save_warmth(warmth)
    else:
        # Toggle Night Shift if no warmth provided
        success = controller.toggle_night_shift()

    # Provide success/failure message
    if success:
        current = controller.get_current_warmth()
        if current > 0:
            print(f"Night Shift enabled (Warmth: {current}%)")
        else:
            print("Night Shift disabled")
    else:
        if controller.nightlight_path:
            print("Failed to control Night Shift")
        else:
            print("Nightlight tool not found")


if __name__ == "__main__":
    main()
