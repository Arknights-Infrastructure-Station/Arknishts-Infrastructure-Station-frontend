import {useData} from "@/store/globalData.js";

function E2C(E) {
    switch (E) {
        case 'trading':
            return '贸易站'
        case 'manufacture':
            return '制造站'
        case 'power':
            return '发电站'
    }
}

function getUserInfrastructureForMower() {
    const data = useData()
    const result = {
        order: {}
    };

    if (data.userInfo && data.userInfo.infrastructure.length) {
        // 先过滤出 name 为 'trading'、'manufacture'、'power' 的对象
        const filteredInfrastructure = data.userInfo.infrastructure.filter(item =>
            item.name === 'trading' || item.name === 'manufacture' || item.name === 'power'
        );

        // 然后对这些对象进行遍历
        filteredInfrastructure.forEach((item, index) => {
            const row = Math.floor(index / 3) + 1;
            const col = (index % 3) + 1;

            result.order[`room_${row}_${col}`] = E2C(item.name);
        });
    }

    // console.log(JSON.stringify(result))
    return JSON.stringify(result);
}

export {E2C, getUserInfrastructureForMower}