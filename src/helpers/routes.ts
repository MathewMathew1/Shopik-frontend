

let BASE_ROUTES_URL: string
let SITE_ROUTE_URL: string

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    BASE_ROUTES_URL = "https://localhost:7243/api/v1/"
    SITE_ROUTE_URL = "http://localhost:3000"
}
else{
    BASE_ROUTES_URL = "https://shopik-api.onrender.com/api/v1/"
    SITE_ROUTE_URL = "https://shopik.onrender.com/"
}


const LOGIN_ROUTE = (): string => {
    return BASE_ROUTES_URL + "auth/login"
}

const SIGNUP_ROUTE = (): string => {
    return BASE_ROUTES_URL + "auth/sign-up"
}

const USER_DATA_ROUTE = (): string => {
    return BASE_ROUTES_URL + "auth/userInfo"
}

const SHOP_ITEMS_ROUTE = ({nameToMatch, seasonToMatch, sortAscending, page, limit}: 
    {nameToMatch?: string, seasonToMatch?: string, sortAscending: boolean, page: number, limit: number}): string => {
    let additionalCriteria = ""
    additionalCriteria = `?sortAscending=${sortAscending}`
    additionalCriteria += `&skip=${(page-1)*limit}`
    additionalCriteria += `&limit=${limit}`
    
    if(nameToMatch!==undefined){
        additionalCriteria += `&nameToMatch=${nameToMatch}`
    }
    if(seasonToMatch!==undefined){
        additionalCriteria += `&seasonToMatch=${seasonToMatch}`
    }
    console.log(BASE_ROUTES_URL + "shopItems" + additionalCriteria)
    return BASE_ROUTES_URL + "shopItems" + additionalCriteria 

}

const SHOP_ITEM_ROUTE = (id: string): string => {
    return BASE_ROUTES_URL + "shopItems/" + id
}

const SHOP_ITEM_REVIEWS = (id: string): string => {
    return BASE_ROUTES_URL + `reviews/shopItem/${id}`
}

const SHOP_ITEM_RATING = (id: string): string => {
    return BASE_ROUTES_URL + `rating/shopItem/${id}`
}

const SHOP_ITEM_REVIEWS_POST = (id: string): string => {
    return BASE_ROUTES_URL + `reviews/shopItem/${id}`
}

const SHOP_ITEM_REVIEWS_UPDATE = (id: string): string => {
    return BASE_ROUTES_URL + `reviews/${id}`
}

const SHOP_ORDER_POST = ():string => {
    return BASE_ROUTES_URL + `order`
}

const SHOP_ORDER_GET = (completed: boolean):string => {
    return BASE_ROUTES_URL + `order?CompletedOrders=${completed}`
}






export {LOGIN_ROUTE, SIGNUP_ROUTE, USER_DATA_ROUTE, SHOP_ITEMS_ROUTE, SHOP_ITEM_ROUTE, SHOP_ITEM_REVIEWS, SHOP_ITEM_RATING,
    SHOP_ITEM_REVIEWS_POST, SHOP_ITEM_REVIEWS_UPDATE, SHOP_ORDER_POST, SITE_ROUTE_URL, SHOP_ORDER_GET}