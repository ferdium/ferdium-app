import asyncio
import argparse
import html

from ferdium_dbus import Client


async def toggle_window(client, args):
    """Toggle window visibility"""

    await client.toggle_window()


async def toggle_mute(client, args):
    """Toggle mute status"""

    await client.toggle_mute()


async def unread(client, args):
    """Get unread messages count"""

    def callback():
        """Print unread count(s)"""

        # For each service
        counts = {}
        for service in client.unread_services:
            name, direct, indirect = service
            safe_name = html.escape(name)

            # If it's exactly the service we're looking for, just return the count
            if safe_name == args.services:
                count = direct
                if not args.direct:
                    count += indirect
                print(count)
                return

            # If the service in included in the services we're looking for
            if args.services in ("total", "all") or safe_name in args.services:
                counts[safe_name] = direct
                if not args.direct:
                    counts[safe_name] += indirect

        # Get total notifications
        if args.services == "total":
            print(sum(counts.values()))
            return

        # Finally, print each service notifications on a different line
        print(
            "\n".join(
                f"{name}: {count}"
                for name, count in counts.items()
            )
        )

    # Do print counts and keep running if tail mode enabled
    callback()
    if args.tail:
        client.on_change(callback)
        await asyncio.get_running_loop().create_future()


async def main():
    """Main cli interface"""

    # Define commands
    commands = {
        "unread": unread,
        "toggle-mute": toggle_mute,
        "toggle-window": toggle_window,
    }

    # Arguments parser
    argparser = argparse.ArgumentParser(description="Script to interact with Ferdium on your bar")
    subparsers = argparser.add_subparsers(dest="command", required=True)
    # Unread command
    argparser_unread = subparsers.add_parser("unread", help=unread.__doc__)
    argparser_unread.add_argument("-s", "--services", default="total", help="Which services to get notifications from {total, all, <name>} (the name can be a comma-separated list)")
    argparser_unread.add_argument("-d", "--direct", action="store_true", default=False, help="Get only direct (mentions or DM) messages")
    argparser_unread.add_argument("-t", "--tail", action="store_true", default=False, help="Keep running and print on change")
    # Toggle mute and toggle window commands
    argparser_toggle_mute = subparsers.add_parser("toggle-mute", help=toggle_mute.__doc__)
    argparser_toggle_window = subparsers.add_parser("toggle-window", help=toggle_window.__doc__)
    # Get args
    args = argparser.parse_args()

    # Initialise ferdium client
    client = Client()
    await client.connect()
    if not client.running:
        print("not running")
        return

    # Execute command
    await commands[args.command](client, args)


if __name__ == "__main__":
    asyncio.run(main())
