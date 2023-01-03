import asyncio

from dbus_next import DBusError
from dbus_next.aio import MessageBus
from dbus_next.introspection import Node


FERDIUM_BUS_NAME = "org.ferdium.Ferdium"
FERDIUM_OBJECT_PATH = "/org/ferdium"
FERDIUM_INTERFACE_NAME = "org.ferdium.Ferdium"
PROPERTIES_INTERFACE_NAME = "org.freedesktop.DBus.Properties"
DBUS_BUS_NAME = "org.freedesktop.DBus"
DBUS_OBJECT_PATH = "/org/freedesktop/DBus"
DBUS_INTERFACE_NAME = "org.freedesktop.DBus"


class FerdiumClient:
    __bus = None
    __name_has_owner = None
    __ferdium = None
    __properties = None
    __callback = None
    running = False
    muted = False
    unread_direct_message_count = 0
    unread_indirect_message_count = 0
    unread_services = []

    def __init__(self):
        # Cache callback for on/off behavior
        self.__properties_changed_callback = self.__properties_changed

    async def connect(self):
        self.__bus = await MessageBus().connect()
        bus_introspection = await self.__bus.introspect(DBUS_BUS_NAME, DBUS_OBJECT_PATH)
        bus_obj = self.__bus.get_proxy_object(
            DBUS_BUS_NAME, DBUS_OBJECT_PATH, bus_introspection
        )
        bus_dbus = bus_obj.get_interface(DBUS_INTERFACE_NAME)
        bus_dbus.on_name_owner_changed(self.__name_owner_changed)
        bus_dbus.on_name_lost(self.__name_lost)
        self.__name_has_owner = await bus_dbus.call_name_has_owner(FERDIUM_BUS_NAME)
        if self.__name_has_owner:
            await self.__try_get_proxy()
        return self

    def disconnect(self):
        self.__bus.disconnect()

    def on_change(self, callback):
        self.__callback = callback

    async def set_muted(self, muted):
        if self.__ferdium is not None:
            await self.__ferdium.set_muted(muted)

    async def toggle_mute(self):
        if self.__ferdium is not None:
            await self.__ferdium.call_toggle_mute()

    async def toggle_window(self):
        if self.__ferdium is not None:
            await self.__ferdium.call_toggle_window()

    def __name_owner_changed(self, name, old_owner, new_owner):
        if name != FERDIUM_BUS_NAME:
            return
        if new_owner == "":
            self.__name_lost(name)
        elif new_owner != old_owner:
            self.__name_has_owner = True
            asyncio.get_running_loop().create_task(self.__try_get_proxy())

    def __name_lost(self, name):
        if name != FERDIUM_BUS_NAME:
            return
        self.__name_has_owner = False
        self.running = False
        self.__notify()

    async def __try_get_proxy(self):
        if self.__properties is not None:
            try:
                self.__properties.off_properties_changed(
                    self.__properties_changed_callback
                )
            except DBusError:
                # Do not fail if the old object is no longer on the bus
                pass
        try:
            introspection = await self.__poll_for_interface()
            if introspection is None:
                return
            obj = self.__bus.get_proxy_object(
                FERDIUM_BUS_NAME, FERDIUM_OBJECT_PATH, introspection
            )
            self.__ferdium = obj.get_interface(FERDIUM_INTERFACE_NAME)
            self.__properties = obj.get_interface(PROPERTIES_INTERFACE_NAME)
            self.__properties.on_properties_changed(self.__properties_changed_callback)
            self.running = True
            self.__read_properties(
                await self.__properties.call_get_all(FERDIUM_INTERFACE_NAME)
            )
        except DBusError:
            # The object is not on the bus
            self.__ferdium = None
            self.__properties = None
            self.running = False
        self.__notify()

    async def __poll_for_interface(self):
        while self.__name_has_owner:
            introspection = await self.__bus.introspect(
                FERDIUM_BUS_NAME, FERDIUM_OBJECT_PATH
            )
            for interface in introspection.interfaces:
                if interface.name == FERDIUM_INTERFACE_NAME:
                    return introspection
        # Poll until the /org/ferdium object becomes available
        await asyncio.sleep(0.1)
        return None

    def __notify(self):
        if (self.__callback) is not None:
            self.__callback()

    def __read_properties(self, properties):
        for name, variant in properties.items():
            if name == "Muted":
                self.muted = variant.value
            elif name == "UnreadDirectMessageCount":
                self.unread_direct_message_count = variant.value
            elif name == "UnreadIndirectMessageCount":
                self.unread_indirect_message_count = variant.value
            elif name == "UnreadServices":
                self.unread_services = variant.value
            else:
                raise ValueError("Unknown property", name)

    def __properties_changed(
        self, interface_name, changed_properties, invalidated_properties
    ):
        if interface_name != FERDIUM_INTERFACE_NAME:
            return
        self.__read_properties(changed_properties)
        if len(invalidated_properties) != 0:
            raise ValueError("Property invalidation is not supported")
        self.__notify()
