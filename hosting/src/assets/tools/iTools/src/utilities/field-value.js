"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValue = void 0;
var FieldValue = /** @class */ (function () {
    function FieldValue() {
    }
    FieldValue.prototype.control = function (collName, docName, propertyName, step) {
        if (propertyName === void 0) { propertyName = null; }
        if (step === void 0) { step = 1; }
        if (!step || step <= 0) {
            console.error("step must be great than 0.");
            return undefined;
        }
        return propertyName && propertyName.trim() ? "$control(".concat(collName, ",").concat(docName, ",").concat(step, ",").concat(propertyName.trim(), ")") : "$control(".concat(collName, ",").concat(docName, ",").concat(step, ")");
    };
    FieldValue.prototype.bindBatchData = function (index, propertyName) {
        return "$bindBatchData(".concat(index, ",").concat(propertyName, ")");
    };
    FieldValue.prototype.date = function (timezone, format) {
        var str = "$date(";
        if (timezone) {
            str += timezone.trim();
        }
        str += ", ";
        if (format && format.trim()) {
            str += format.trim();
        }
        else {
            str += timezone ? "DH" : "";
        }
        str += ")";
        return timezone ? str.trim() : "$date()";
    };
    FieldValue.prototype.inc = function (value) {
        if (value === void 0) { value = 1; }
        return "$inc(".concat(value ? value : 1, ")");
    };
    FieldValue.prototype.unset = function () {
        return "$unset()";
    };
    return FieldValue;
}());
exports.FieldValue = FieldValue;
