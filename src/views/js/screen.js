let professionDict = [
    {label: "先锋", value: "PIONEER"},
    {label: "近卫", value: "WARRIOR"},
    {label: "重装", value: "TANK"},
    {label: "狙击", value: "SNIPER"},
    {label: "术师", value: "CASTER"},
    {label: "医疗", value: "MEDIC"},
    {label: "辅助", value: "SUPPORT"},
    {label: "特种", value: "SPECIAL"},
];

let rarityDict = [
    {label: "1★", value: 1},
    {label: "2★", value: 2},
    {label: "3★", value: 3},
    {label: "4★", value: 4},
    {label: "5★", value: 5},
    {label: "6★", value: 6},
];

function getProfession(str) {
    if ("SNIPER" === str) return "狙击";
    if ("WARRIOR" === str) return "近卫";
    if ("SPECIAL" === str) return "特种";
    if ("MEDIC" === str) return "医疗";
    if ("SUPPORT" === str) return "辅助";
    if ("PIONEER" === str) return "先锋";
    if ("TANK" === str) return "重装";
    if ("CASTER" === str) return "术师";
    return "";
}

/**
 * 根据中文职业数组获取英文职业数组
 * @param professionArray 中文职业数组
 * @returns {*[]} 英文职业数组
 */
function getEnProfessionArray(professionArray) {
    const enProfessionArray = []
    if (professionArray.length === 0) { //数组为空则为全选
        for (const p of professionDict)
            enProfessionArray.push(p.value)
    } else {
        for (const p of professionArray) {
            let item = professionDict.find(item => item.label === p)
            if (item) enProfessionArray.push(item.value)
        }
    }
    return enProfessionArray
}

/**
 * 根据稀有度字符串数组获取稀有度数字数组
 * @param rarityArray 稀有度字符串数组
 * @returns {*[]} 稀有度数字数组
 */
function getNumRarityArray(rarityArray) {
    const numRarityArrayArray = []
    if (rarityArray.length === 0) { //数组为空则为全选
        for (const r of rarityDict)
            numRarityArrayArray.push(r.value)
    } else {
        for (const r of rarityArray) {
            let item = rarityDict.find(item => item.label === r)
            if (item) numRarityArrayArray.push(item.value)
        }
    }
    return numRarityArrayArray
}

/**
 * 根据当前选中的拥有状态返回拥有状态数组
 * @param ownerShip 当前选中的拥有状态
 * @returns {*[]} 拥有状态数组
 */
function getOwnerShipArr(ownerShip) {
    const ownerStates = []
    if (ownerShip === '') {
        ownerStates.push(true)
        ownerStates.push(false)
    } else
        ownerStates.push(ownerShip==='已拥有')
    return ownerStates
}

/**
 * 两个包含对象的数组取交集，顺序以arr1为主
 */
function intersectObjects(arr1, arr2, compareKey) {
    return arr1.filter(obj1 =>
        arr2.some(obj2 => obj1[compareKey] === obj2[compareKey])
    );
}

export {
    professionDict,
    rarityDict,
    getProfession,
    getEnProfessionArray,
    getNumRarityArray,
    getOwnerShipArr,
    intersectObjects,
};
