function parseDate(dateString) {
    const parts = dateString.match(/(\d+)/g);
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
}

function formatDate(date) {
    const padZero = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatJSON(json) {
    return JSON.stringify(JSON.parse(json.trim()), null, 2).trim()
}

//压缩掉影响传输的特殊字符
function compressData(obj) {
    const jsonString = JSON.stringify(obj);
    return jsonString.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s_,.!?[\]{}":-]/g, "");
}

function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return null;

    const parsedValue = parseJSONSafely(storedValue);
    return deepParseJSON(parsedValue);
}

function parseJSONSafely(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

/*
不解析fileContent，让作业文件内容保持为字符串类型
不解析description，以防将纯数字格式的描述解析成数字
不解析layout，避免解析为数字类型
不解析id、wid、uid，避免因为过长而导致精度损失
*/
const excludeParse = ['fileContent', 'description', 'layout', 'id', 'wid', 'uid', 'authorId']

function deepParseJSON(obj) {
    if (typeof obj === 'string') {
        return parseJSONSafely(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(item => deepParseJSON(item));
    } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
            if (!excludeParse.includes(key)) {
                obj[key] = deepParseJSON(obj[key]);
            }
        });
        return obj;
    } else {
        return obj;
    }
}


export {parseDate, formatDate, compressData, saveToLocalStorage, getFromLocalStorage, formatJSON}