const sleep = (ms: number) => { 
    return new Promise(r => setTimeout(r, ms))
}

const getDateFromOffset = (offset: string) => {
    var dt = new Date(offset); 
    
    let day = dt.getDate()
    let month = dt.getMonth()
    let year = dt.getFullYear()

    const date = `${day}/${month}/${year}`
    return date
}

const capitalizedString = (string: string): string => {
    let splitStr = string.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {

        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }

    return splitStr.join(' '); 
 }

export { sleep, getDateFromOffset, capitalizedString }