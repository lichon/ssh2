'use strict';

const { deflateSync, inflateSync } = require('zlib');

class ZlibPacketWriter {
  constructor(protocol, deflateFn) {
    this.allocStart = 0;
    this.allocStartKEX = 0;
    this._protocol = protocol;
    this._deflate = (typeof deflateFn === 'function' ? deflateFn : deflateSync);
  }

  cleanup() {}

  alloc(payloadSize, force) {
    return Buffer.allocUnsafe(payloadSize);
  }

  finalize(payload, force) {
    if (this._protocol._kexinit === undefined || force) {
      const output = this._deflate(payload);
      const packet = this._protocol._cipher.allocPacket(output.length);
      packet.set(output, 5);
      return packet;
    }
    return payload;
  }
}

class PacketWriter {
  constructor(protocol) {
    this.allocStart = 5;
    this.allocStartKEX = 5;
    this._protocol = protocol;
  }

  cleanup() {}

  alloc(payloadSize, force) {
    if (this._protocol._kexinit === undefined || force)
      return this._protocol._cipher.allocPacket(payloadSize);
    return Buffer.allocUnsafe(payloadSize);
  }

  finalize(packet, force) {
    return packet;
  }
}

class ZlibPacketReader {
  constructor(inflateFn) {
    this._inflate = (typeof inflateFn === 'function' ? inflateFn : inflateSync);
  }

  cleanup() {}

  read(data) {
    return this._inflate(data);
  }
}

class PacketReader {
  cleanup() {}

  read(data) {
    return data;
  }
}

module.exports = {
  PacketReader,
  PacketWriter,
  ZlibPacketReader,
  ZlibPacketWriter,
};
