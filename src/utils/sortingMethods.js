const sortingMethod3 = (arr, order = 'asc') => {
    const len = arr.length;
    let swapped;

    for (let i = 0; i < len - 1; i++) {
        swapped = false;

        for (let j = 0; j < len - 1 - i; j++) {
            let shouldSwap;
            if (order === 'desc') {
                shouldSwap = arr[j].mobileNumber < arr[j + 1].mobileNumber;
            } else {
                shouldSwap = arr[j].mobileNumber > arr[j + 1].mobileNumber;
            }

            if (shouldSwap) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }

        if (!swapped) break;
    }

    return arr;
}


const sortingMethod4 = (arr, order) => {
    const len = arr.length;

    for (let i = 0; i < len - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < len; j++) {
            const shouldSwap = order === 'desc' ? arr[j].mobileNumber > arr[minIndex].mobileNumber : arr[j].mobileNumber < arr[minIndex].mobileNumber;

            if (shouldSwap) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }

    return arr;
}

const sortingMethod5 = (arr, order) => {
    return arr.map(item => item)
        .sort((a, b) => {
            if (order === 'desc') {
                return b.mobileNumber.localeCompare(a.mobileNumber);
            } else {
                return a.mobileNumber.localeCompare(b.mobileNumber);
            }
        });
}

export { sortingMethod3, sortingMethod4, sortingMethod5 };
