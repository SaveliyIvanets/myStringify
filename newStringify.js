function myStringify(value, space) {
  if (!!value.toJSON && typeof value.toJSON === "function") {
    try {
      value = value.toJSON();
    } catch (error) {
      throw error;
    }
  }
  if (
    ["string", "number", "boolean"].includes(typeof value) ||
    value === null
  ) {
    return typeof value === "string" ? `"${value}"` : `${value}`;
  }
  if (Array.isArray(value)) {
    return arrayToJSON(value, space);
  }
  if (typeof value === "object") {
    return objToString(value, space, false, 2, space);
  }
}
function arrayToJSON(array, space) {
  return doSpaceInArray(
    stringToArray(
      `[${array.map((item) =>
        Array.isArray(item)
          ? arrayToString(item)
          : item === undefined || item === null
          ? "null"
          : typeof item === "string"
          ? `"${item}"`
          : item
      )}]`
    ),
    space
  );
}
function arrayToString(arr) {
  let newArr = arr.concat();
  for (let i = 0; i < newArr.length; i++) {
    if (Array.isArray(newArr[i])) {
      newArr[i] = arrayToString(newArr[i]);
      continue;
    }
    newArr[i] =
      typeof newArr[i] === "string"
        ? `"${newArr[i]}"`
        : newArr[i] === null || newArr[i] === undefined
        ? "null"
        : // : Object.prototype.toString.call(newArr[i]).slice(8, -1) === "Object"
          // ? objToString(newArr[i])
          newArr[i];
  }
  return `[${newArr}]`;
}

function doSpaceInArray(arr, space) {
  if (space === 0) {
    return arr.reduce((sum, curr) => sum + curr, "");
  }
  let bracketCount = 0;
  for (let i = 0; i < arr.length; i++) {
    if (i !== 0 && arr[i - 1].includes("[") && !arr[i - 1].includes("]")) {
      bracketCount++;
    } else {
      if (i !== 0 && !arr[i].includes("[") && arr[i].includes("]")) {
        bracketCount--;
      }
    }

    arr[i] = `${" ".repeat(bracketCount >= 0 ? bracketCount * space : 0)}${
      arr[i]
    }\n`;
  }
  let result = arr.reduce((sum, curr) => sum + curr, "");
  return result.slice(0, result.length - 1);
}

function stringToArray(str) {
  let ansArr = [];
  let k = 0;
  let generalElem = "";
  for (let i = 0; i < str.length; i++) {
    if (["[", "]", ","].includes(str[i])) {
      if (str[i] === "[" && str[i + 1] === "]") {
        ansArr[k] = "[]";
        k++;
        continue;
      }

      if (str[i - 1] === "[" && str[i] === "]") {
        continue;
      }

      if (generalElem !== "") {
        ansArr[k] = generalElem;
        generalElem = "";
        k++;
      }

      if (str[i] !== ",") {
        ansArr[k] = str[i];
        k++;
      } else {
        if (str[i] === ",") {
          if (i != 0 && str[i - 1] === ",") {
            ansArr[k] = "null,";
            k++;
          } else {
            ansArr[k - 1] += ",";
          }
        }
      }
    } else {
      generalElem += str[i];
    }
  }
  return ansArr;
}

function haveCycle(obj) {
  for (key in obj) {
    if (obj[key] === obj) {
      return true;
    }
  }
  return false;
}
function objToString(usObj, space, heirFlag = false, heircount = 2, trueSpace) {
  if (Object.keys(usObj).length === 0 && heirFlag) {
  }
  if (haveCycle(usObj)) {
    throw new TypeError("TypeError: Converting circular structure to JSON");
  }
  let obj = [];
  Object.assign(obj, usObj);
  let strArr = ["{"];
  for (key in obj) {
    if (typeof obj[key] === "bigint") {
      throw new TypeError("BigInt value can't be serialized in JSON");
    }
    if (
      Object.prototype.toString.call(obj[key]).slice(8, -1) === "Object" &&
      obj[key] !== null
    ) {
      strArr.push(
        `\n${" ".repeat(space)}"${key}": ${objToString(
          obj[key],
          trueSpace * heircount,
          true,
          heircount + 1,
          trueSpace < space ? trueSpace : space
        )},`
      );
      continue;
    }
    if (
      ![
        "Array",
        "Object",
        "String",
        "Number",
        "Boolean",
        "Function",
        "Null",
        "Undefined",
        "Date",
      ].includes(Object.prototype.toString.call(obj[key]).slice(8, -1))
    ) {
      strArr.push(`\n${" ".repeat(space)}"${key}": {},`);
      continue;
    } else {
      if (Object.prototype.toString.call(obj[key]).slice(8, -1) === "Date") {
        strArr.push(
          `\n${" ".repeat(space)}"${key}": "${obj[key].toISOString()}",`
        );
        continue;
      }
      if (Object.prototype.toString.call(obj[key]).slice(8, -1) === "Array") {
        strArr.push(
          `\n${" ".repeat(space)}"${key}": ${arrayToJSON(obj[key], space)
            .split("\n")
            .map((item) => {
              if (item !== "[" && item !== "]") {
                return heirFlag
                  ? " ".repeat(space / (heircount - 1)) + item
                  : " ".repeat(space) + item;
              } else {
                if (item !== "[") {
                  return " ".repeat(space) + item;
                }
                return item;
              }
            })
            .join("\n")},`
        );
        continue;
      }
    }
    if (obj[key] !== undefined && typeof obj[key] !== "function") {
      obj[key] =
        obj[key] === null
          ? "null"
          : typeof obj[key] === "string"
          ? `"${obj[key]}"`
          : obj[key];

      strArr.push(`\n${" ".repeat(space)}"${key}": ${obj[key]},`);
    }
  }
  if (heirFlag) {
    strArr.push([`\n${" ".repeat(space - trueSpace)}}`]);
  } else {
    strArr.push(["\n}"]);
  }
  strArr[strArr.length - 2] = strArr[strArr.length - 2].slice(
    0,
    strArr[strArr.length - 2].length - 1
  );
  return strArr.reduce((sum, curr) => sum + curr, "");
}

let space = 2;
const check = { a: {} };

let my = myStringify(check, space);
let their = JSON.stringify(check, null, space);
console.log(my === their);
console.log(my);
console.log();
console.log(their);
// не работает с пустыми объектами и массивами
// не работает если в массиве объект
// arraytoString -> stringToArray - > doSpaceInArray -> arrayToJSON
// arrayToString -
