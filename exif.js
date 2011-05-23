Exif = {};

(function () {
  var MARKER_SOI  = 0xffd8;
  var MARKER_APP1 = 0xffe1;

  function Uint8ArrayReader(arr, endian) {
    this.arr = new Uint8Array(arr);
    this.endian = !!endian; //true : Little(Intel) false : Big(Motorola)
    this.cur = 0;
  }

  Uint8ArrayReader.LITTLE_ENDIAN = 0;
  Uint8ArrayReader.BIG_ENDIAN    = 1;

  Uint8ArrayReader._makeReadMethod = function (size) {
    return function (offset, endian) {
      var target;

      offset || (offset = 0);
      typeof endian === "undefined" && (endian = this.endian);
      target = this.arr.subarray(offset, offset + size);

      return Uint8ArrayReader._pack(target, endian);
    };
  };

  Uint8ArrayReader._pack = function (arr, endian) {
    var f = endian
      ? Array.prototype.reduceRight   // Little Endian
      : Array.prototype.reduce;       // Big Endian

    return f.call(arr, function (a, b) {
      return (a << 8) + b;
    }, 0);
  };

  Uint8ArrayReader.prototype.byte  = Uint8ArrayReader._makeReadMethod(2);
  Uint8ArrayReader.prototype.word  = Uint8ArrayReader._makeReadMethod(4);
  Uint8ArrayReader.prototype.dword = Uint8ArrayReader._makeReadMethod(8);

  Exif.loadFromArray = function (arr) {
    var soi, app1 = {}, cur = 2;

    reader = new Uint8ArrayReader(arr, true);

    //check magic byte
    soi = reader.byte(0);
    if (soi !== MARKER_SOI) {
      throw "Not JPG file format";
    }

    //check if file format is Exif
    app1.marker = reader.byte(2);
    if (app1.marker !== MARKER_APP1) {
      throw "Not Exif file format";
    }

    app1.size = reader.byte(4);

  };

})();
