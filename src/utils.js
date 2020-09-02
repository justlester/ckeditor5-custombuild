export const lowerCase = (text) => {
    return text.toLowerCase();
}

export const upperCase = (text) => {
    return text.toUpperCase();
}

export const capitalizeCase = (text) => {
    return text.toLowerCase().split(' ').map(word=>word.charAt(0).toUpperCase()+word.substring(1)).join(' ');    
};

export const toggleCase = (text) => {
    return text.split('').map(x=>{
        if(x === x.toLowerCase()){
            x = x.toUpperCase();
        }else {
            x = x.toLowerCase();
        }
        return x;
    }).join('');
};

export const getText = (range) => {
    return Array.from(range.getItems()).reduce((rangeText, node) => {
        if (node.is('softBreak')) {
            // Trim text to a softBreak.
            return '';
        }
        return rangeText + node.data;
    }, '');
}