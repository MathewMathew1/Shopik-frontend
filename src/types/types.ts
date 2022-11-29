export enum RoleEnum{
    SuperAdmin,
    Admin,
    User,
    Worker,
} 

export enum SeasonEnum{
    Winter = "Winter",
    Summer =" Summer",
    Any = "Any"
} 

export type AdditionalParameters = {
    nameToMatch?: string
    seasonToMatch?: string
    sortAscending: boolean
    limit: number
    page: number
}

export type UserInfo = {
    id: string;
    username: string;
    createdDate: string;
    role: RoleEnum;
} 

export enum severityColors {
    error = "rgb(240, 56, 19)",
    warning = "rgb(247, 247, 10)",
    success = "rgb(18, 230, 113)",
}

export type ShopItem = {
    id: string;
    name: string;
    price: number;
    description: string;
    season: SeasonEnum;
    createdDate: string;
    amountOfRatings: number;
    averageRating: number;
    imageFilePath: string;
}

export type ShopItemReview = {
    id: string;
    userId: string;
    shopItemId: string;
    reviewText: string;
    createdDate: string;
    rateFromUser?: {
        rate: number
        createDate: string
    }
    userSending?: {
        username: string,
        role: RoleEnum,
        createdDate: string
    }
}

export type CartItem = {
    amount: number,
    item: ShopItem
}

export type Order = {
    address: string,
    postalCode: string,
    country: string,
    region: string, 
    city: string
    createdDate: string,
    details: {
        isOrderCompleted: boolean,
        workerConfirmingDeliveryId?: string,
        completeDate?: string
    }
    expectedDeliveryTime: string
    id: string
    items: ShopItem[]
    orderedItems: {
        shopItemId: string
        amount: number
        item: ShopItem
    }[]
    transactionConfirmed: boolean
    userId: string
}






