#!/usr/bin/env python
import asyncio
import html
import json
import sys


from ferdium_client import FerdiumClient


MESSAGE_ICON = "\uf075"  # Nerd Font nf-fa-comment
NO_MESSAGE_ICON = "\uf0e5"  # Nerd Font nf-fa-comment_o
MUTED_ICON = "\uf1f6"  # Nerd Font nf-fa-bell_slash


def service_to_message(service, total_direct=None):
    [name, direct, _indirect] = service
    safe_name = html.escape(name)
    if direct > 0:
        if total_direct is not None and direct != total_direct:
            return f"{safe_name} ({direct}/{total_direct})"
        else:
            return f"{safe_name} ({direct})"
    else:
        return safe_name


def create_status(client):
    if not client.running:
        return {"text": "", "tooltip": "", "class": ""}
    tooltip = ", ".join(
        [service_to_message(service) for service in client.unread_services]
    )
    if client.muted:
        return {"text": MUTED_ICON, "tooltip": tooltip, "class": "muted"}
    for service in client.unread_services:
        [name, direct, _indirect] = service
        if direct > 0:
            service_text = service_to_message(
                service, client.unread_direct_message_count
            )
            return {
                "text": f"{MESSAGE_ICON} {service_text}",
                "tooltip": tooltip,
                "class": "direct",
            }
    for service in client.unread_services:
        [name, _direct, indirect] = service
        if indirect > 0:
            return {
                "text": f"{MESSAGE_ICON} {name}",
                "tooltip": tooltip,
                "class": "indirect",
            }
    return {"text": NO_MESSAGE_ICON, "tooltip": tooltip, "class": "idle"}


def print_status(client):
    status = create_status(client)
    print(json.dumps(status))
    sys.stdout.flush()


async def main(subcommand):
    client = FerdiumClient()

    if subcommand == "status":

        def callback():
            print_status(client)

        callback()
        client.on_change(callback)
        await client.connect()
        await asyncio.get_running_loop().create_future()
    else:
        await client.connect()
        if subcommand == "toggle-mute":
            await client.toggle_mute()
        elif subcommand == "toggle-window":
            await client.toggle_window()
        else:
            print("Unknown subcommand:", subcommand)
        client.disconnect()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage:", __file__, "status | toggle-mute | toggle-window")
    else:
        asyncio.run(main(sys.argv[1]))
