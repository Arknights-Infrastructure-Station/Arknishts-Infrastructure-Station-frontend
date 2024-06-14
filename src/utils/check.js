export {isJsonFile, isNumeric,isValidEmail}

/**
 * 检查文件是否是JSON文件
 * @param file 要检查的文件
 * @param type 文件类型，默认为MAA
 * @returns {Promise<boolean>} 是否是JSON文件
 */
async function isJsonFile(file, type = 'MAA') {
    try {
        const text = await file.text(); // 使用 File API 的 text 方法直接读取文本内容
        JSON.parse(text); // 尝试解析文件内容
        return true; // 文件内容是有效的 JSON ，准许上传
    } catch (error) {
        return false; // 拒绝上传
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false; // 确保输入是一个字符串
    return !isNaN(str) && !isNaN(parseFloat(str)); // 检查是否为数字
}

/**
 * 检查邮箱格式是否正确
 * @param email 要检查的邮箱
 * @returns {boolean} 是否正确
 */
function isValidEmail(email) {
    // 定义邮箱格式的正则表达式
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // 使用正则表达式测试字符串是否符合邮箱格式
    return emailPattern.test(email);
}