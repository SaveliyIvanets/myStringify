//P.S кажется что массивы и объекты работают хорошо
// если в объекте массив то все хорошо (вроде), но если в массиве объект то начинаются страшные вещи....(я бы сказал оно чуть чуть работает...)
// space = 0 не работает ИЗ-ЗА незначительного бага с отступами, который я могу пофиксить но после борбы с массивами у меня нет сил.......
function myStringify(value, space) {
  if (typeof value === "bigint") {
    throw new TypeError("BigInt value can't be serialized in JSON");
  }
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "function") {
    return "null";
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
    ].includes(Object.prototype.toString.call(value).slice(8, -1))
  ) {
    return "{}";
  }
  if (!isFinite(value)) {
    return "null";
  }
  if (Object.prototype.toString.call(value).slice(8, -1) === "Data") {
    return value.toISOString();
  }
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
    if (space === 0) {
      return addComma(arrayToJSON(value, space))
        .replaceAll(",,", ",")
        .split("\n")
        .join("");
    }
    return addComma(arrayToJSON(value, space)).replaceAll(",,", ",");
  }
  if (typeof value === "object") {
    if (space === 0) {
      objToString(value, space, false, 2, space).split("\n").join("");
    }
    return objToString(value, space, false, 2, space);
  }
}
function doSpaceInObject(json, space) {
  return json
    .split("\n")
    .map((item) =>
      item.toString().includes("]") || item.toString().includes("[")
        ? " ".repeat(space) + item
        : " ".repeat(space) + item
    )
    .join("\n");
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
  if (Object.keys(usObj).length === 0) {
    return "{}";
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
      obj[key] !== null &&
      Object.keys(obj[key]).length !== 0 &&
      !Object.values(obj[key]).reduce(
        (sum, curr) => sum && curr === undefined,
        true
      )
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
    } else {
      if (
        Object.prototype.toString.call(obj[key]).slice(8, -1) === "Object" &&
        obj[key] !== null &&
        (Object.keys(obj[key]).length === 0 ||
          Object.values(obj[key]).reduce(
            (sum, curr) => sum && curr === undefined,
            true
          ))
      ) {
        strArr.push(`\n${" ".repeat(space)}"${key}": {},`);
        continue;
      }
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
          `\n${" ".repeat(space)}"${key}": ${addComma(
            arrayToJSON(obj[key], space)
          )
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
      if (Object.prototype.toString.call(obj[key]).slice(8, -1) === "Number") {
        if (isFinite(obj[key])) {
          strArr.push(`\n${" ".repeat(space)}"${key}": ${obj[key]},`);
        } else {
          strArr.push(`\n${" ".repeat(space)}"${key}": null,`);
        }
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
function doArrayInCorrectForm(arr) {
  let ansArr = arr.concat();
  if (ansArr.length > 0 && ansArr.filter(() => true).length === 0) {
    let newAnsArr = [];
    for (let i = 0; i < ansArr.length; i++) {
      newAnsArr.push("null");
    }
    return newAnsArr;
  } else {
    if (ansArr.length > 0 && ansArr.filter(() => true).length > 0) {
      for (let i = 0; i < ansArr.length; i++) {
        ansArr[i] = i in ansArr ? ansArr[i] : null;
      }
    }
  }

  return ansArr.map((item) =>
    item === null ||
    item === undefined ||
    typeof item === "function" ||
    (typeof item === "number" && !isFinite(item))
      ? "null"
      : typeof item === "string" && !item.includes("[") && !item.includes("]")
      ? `"${item}"`
      : Array.isArray(item)
      ? doArrayInCorrectForm(item)
      : Object.prototype.toString.call(item).slice(8, -1) === "Date"
      ? `"${item.toISOString()}"`
      : ![
          "Array",
          "Object",
          "String",
          "Number",
          "Boolean",
          "Function",
          "Null",
          "Undefined",
          "Date",
        ].includes(Object.prototype.toString.call(item).slice(8, -1))
      ? "{}"
      : item
  );
}
function arrayToJSON(array, space, enclosure = 1) {
  if (space > 10) {
    space = 10;
  }
  let jsonArray = array.concat();
  let bracketCount = 0;

  jsonArray.unshift(`${" ".repeat((enclosure - 1) * space)}[\n`);
  jsonArray.push(`${" ".repeat((enclosure - 1) * space)}]`);
  if (enclosure === 1) {
    jsonArray = doArrayInCorrectForm(jsonArray);
  }
  for (let i = 0; i < jsonArray.length; i++) {
    if (Array.isArray(jsonArray[i])) {
      if (jsonArray[i].length === 0) {
        jsonArray[i] =
          i + 1 !== jsonArray.length &&
          jsonArray[i + 1].toString().includes("]")
            ? `${" ".repeat(enclosure * space)}[]\n`
            : `${" ".repeat(enclosure * space)}[],\n`;
      } else {
        jsonArray[i] = `${arrayToJSON(jsonArray[i], space, enclosure + 1)}\n`;
        bracketCount =
          !Array.isArray(jsonArray[i + 1]) && i + 1 != jsonArray.length
            ? space * enclosure
            : bracketCount;
        continue;
      }
    }
    if (
      Object.prototype.toString.call(jsonArray[i]).slice(8, -1) === "Object"
    ) {
      jsonArray[i] =
        i + 1 !== jsonArray.length && jsonArray[i + 1].toString().includes("]")
          ? `${doSpaceInObject(
              objToString(jsonArray[i], space, false, 2, space),
              space * enclosure
            )}\n`
          : `${doSpaceInObject(
              objToString(jsonArray[i], space, false, 2, space),
              space * enclosure
            )}\n`;
      bracketCount += space * enclosure;
      continue;
    }
    if (
      i !== 0 &&
      jsonArray[i - 1].toString().includes("[") &&
      !jsonArray[i - 1].toString().includes("]")
    ) {
      bracketCount += space * enclosure;
    } else {
      if (
        !jsonArray[i].toString().includes("[") &&
        jsonArray[i].toString().includes("]")
      ) {
        bracketCount -= space * (enclosure - 1);
      }
    }
    bracketCount = bracketCount < 0 ? 0 : bracketCount;
    if (
      !jsonArray[i].toString().includes("]") &&
      !jsonArray[i].toString().includes("[")
    ) {
      jsonArray[i] =
        i + 1 !== jsonArray.length && jsonArray[i + 1].toString().includes("]")
          ? `${" ".repeat(bracketCount)}${jsonArray[i]}\n`
          : `${" ".repeat(bracketCount)}${jsonArray[i]},\n`;
    }
  }

  return jsonArray.reduce((sum, curr) => sum + curr, "");
}
function addComma(json) {
  json = json.split("\n");
  for (let i = 0; i < json.length - 1; i++) {
    if (
      (json[i].toString().includes("]") || json[i].toString().includes("}")) &&
      (!json[i + 1].toString().includes("]") ||
        json[i + 1].toString().includes("[]")) &&
      !json[i].toString().includes("[]") &&
      (!json[i + 1].toString().includes("}") ||
        json[i + 1].toString().includes("{}"))
    ) {
      json[i] += ",";
    }
  }
  return json.join("\n");
}
let space = 7;
const testArray = [
  1,
  true,
  "str",
  null,
  undefined,
  NaN,
  Infinity,
  [[[[[[[]]]]]]],
  new Set(),
  new Map(),
  new Date(),
  function () {},
  [, , , , , , ,],
  new Array(2),
  {},
  { 1: 1, 2: 2, 3: 3 },
  [
    ,
    ,
    ,
    "NUMBERS AND NULLS:",
    ,
    ,
    1,
    ,
    ,
    1,
    ,
    ,
    ,
    new Array(2),
    ,
    ,
    [1, 1],
    [
      1,
      1,
      1,
      [1, , 1, 1, 1, 1, [1, 1]],
      1,
      2,
      2,
      [1, 1, 1, [1, 1, 1, 1, [1, [1]]]],
    ],
  ],
  [[[[]][[]]]], // - мой любимый кейс
  [],
];
const testObject = {
  num: 12,
  bool: true,
  str: "string",
  nul: null,
  und: undefined,
  child: { grandson: { name: "Jhon" }, job: {} },
  func: function (a) {},
  map: new Map(),
  set: new Set(),
  data: new Date(),
  Nan: NaN,
  Infinity: Infinity,
  wow: {},
  easyArr: [1, 2, 3, 4],
  hardArr: [
    1,
    2,
    3,
    true,
    null,
    undefined,
    ,
    ,
    ,
    ,
    ,
    ,
    function () {},
    [[[[[[[["wow"]]]]]]]],
    { objInArray: true },
    [
      ,
      ,
      ,
      "NUMBERS AND NULLS:",
      ,
      ,
      1,
      ,
      ,
      1,
      ,
      ,
      ,
      new Array(2),
      ,
      ,
      [1, 1],
      [
        1,
        1,
        1,
        [1, , 1, 1, 1, 1, [1, 1]],
        1,
        2,
        2,
        [1, 1, 1, [1, 1, 1, 1, [1, [1]]]],
      ],
    ],
  ],
  empty: [],
};
let my = myStringify(testObject, space);
let their = JSON.stringify(testObject, null, space);
console.log(my === their);
console.log(my);
console.log();
console.log(their);
