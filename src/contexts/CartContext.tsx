import  {createContext, useContext, useEffect, useRef, useState,} from "react";
import useArray from "../customHooks/useArray";
import { SHOP_ITEM_ROUTE } from "../helpers/routes";
import { CartItem, severityColors, ShopItem } from "../types/types";
import { useUpdateSnackbar } from "./SnackBarContext";
import { TRANSACTION_SUCCESS_VALUES } from "../components/MainPage/Navbar";
import { useSearchParams } from "react-router-dom";

const CART_ITEMS = "cartItems"

export type SnackbarInfo = {
    message: string,
    severity: severityColors
}

type CartContextProps = {    
    cartItems: CartItem[]
    amountOfItemInCart: number
    totalPayment: number
    shopItemInfos: ShopItem[]
    getInfoAboutItem: (itemId: string) => Promise<ShopItem|null>
}

type CartUpdateProps = {    
    addItemToCart: (shopItem: ShopItem, amount: number) => void
    removeAllItemsFromId: (id: string) => void   
    removeOneItemFromId: (id: string) => void
    clearCart: () => void
    addItemInfoToItems: (item: ShopItem) => void
    
}

const CartContext = createContext({} as CartContextProps)
const CartUpdate = createContext({} as CartUpdateProps)

export function useCart(){
    return useContext(CartContext)
}

export function useUpdateCart(){
    return useContext(CartUpdate)
}

const CartProvider = ({ children }: {children: any}): JSX.Element => {
    const cartItems = useArray<CartItem>([])
    const [amountOfItemInCart, setAmountOfNumbersInCart] = useState(0)
    const [totalPayment, setTotalPayment]  = useState(0)
    const [searchParam, setSearchParam] = useSearchParams()
    const shopItemInfos = useArray<ShopItem>([])
    
    const firstUpdate = useRef(true);

    const controller = new AbortController()
    const updateSnackbar = useUpdateSnackbar()

 /*   const addCartToShopItemToBuy = () => {
        console.table(cartItems.array)
        for(let i=0; i<cartItems.array.length; i++){
            let index = shopItemToBuy.array.findIndex((item)=>item.item.id===cartItems.array[i].item.id)
            let cartItem = cartItems.array[i]
            console.log({cartItem})

            if(index === -1){
                
                shopItemToBuy.push({...cartItem})

                continue
            }
            
            shopItemToBuy.updateObjectByIndex(index, [{
                field: "amount",
                fieldValue: cartItem.amount+shopItemToBuy.array[index].amount
            }])

        }

    }*/

 /*   const removeCartToShopItemToBuy = () => {
        for(let i=0; i<cartItems.array.length; i++){
            let index = shopItemToBuy.array.findIndex((item)=>item.item.id===cartItems.array[i].item.id)
            let cartItem = cartItems.array[i]

            if(index === -1){
                continue
            }
            console.log(shopItemToBuy.array[index].amount - cartItem.amount)
            if(shopItemToBuy.array[index].amount - cartItem.amount < 1){
                shopItemToBuy.removeValueByIndex(index)
                continue
            }
            
            shopItemToBuy.updateObjectByIndex(index, [{
                field: "amount",
                fieldValue: shopItemToBuy.array[index].amount - cartItem.amount
            }])

        }
    }*/

    const addItemInfoToItems = (item: ShopItem) => {
        const index = shopItemInfos.findIndexByKey("id", item.id)
        if(index===-1) {
            shopItemInfos.push(item)
            return
        }

        shopItemInfos.replaceObjectByIndex(index, item)

        
    }

    const getInfoAboutItem = async (itemId: string): Promise<ShopItem|null> => {
        const index = shopItemInfos.findIndexByKey("id", itemId)

        if(index!==-1) return shopItemInfos.array[index]

        const { signal } = controller

        let item: ShopItem|null = null

        await fetch(SHOP_ITEM_ROUTE(itemId),{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => response.json())
            .then(response => {
                if(!("error" in response)){
                    item = response.item    
                    addItemInfoToItems(response.item)
                }
            })
            .finally(()=>{return item})
            .catch(error=>{console.log(error)})

        return item    

            
 
    }
        
    useEffect(() => {
        let cart = searchParam.get(TRANSACTION_SUCCESS_VALUES.cartRemove.key)
        if(cart===TRANSACTION_SUCCESS_VALUES.cartRemove.value){
            clearCart()
            return
        }

        let oldCartItems = localStorage.getItem(CART_ITEMS)

        if(oldCartItems===null) return
        
        let oldCartItemsParsed = JSON.parse(oldCartItems)
        cartItems.set(oldCartItemsParsed)
        
        let amountOfItems = oldCartItemsParsed.reduce((accum: number,item: CartItem)=>accum+item.amount, 0)
        setAmountOfNumbersInCart(amountOfItems)

        let amountOfCashForCart = oldCartItemsParsed.reduce((accum: number,item: CartItem)=>accum+item.amount*item.item.price, 0)
        setTotalPayment(amountOfCashForCart)
        
        console.table(oldCartItemsParsed)

        return () => {
            
            controller.abort()
        }  
    }, []);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }
        else{
            localStorage.setItem(CART_ITEMS, JSON.stringify(cartItems.array))
            let amountOfCashForCart = cartItems.array.reduce((accum: number,item: CartItem)=>accum+item.amount*item.item.price, 0)
            setTotalPayment(amountOfCashForCart)
        }

        
    }, [amountOfItemInCart]);

    const addItemToCart = (shopItem: ShopItem, amount: number): void => {
        let index = cartItems.array.findIndex((cartItem)=>cartItem.item.id===shopItem.id)
        
        if(index === -1){
            let cartItem = {
                item: shopItem,
                amount
            }
            cartItems.push(cartItem)
            updateSnackbar.addSnackBar({snackbarText: "Added item to cart", severity: severityColors.success})
            setAmountOfNumbersInCart(amountOfItemInCart+amount)
            return
        }

        cartItems.updateObjectByIndex(index, [{
            field: "amount",
            fieldValue: amount+cartItems.array[index].amount
        }])
        updateSnackbar.addSnackBar({snackbarText: "Added item to cart", severity: severityColors.success})
        setAmountOfNumbersInCart(amountOfItemInCart+amount)
    }

    const removeAllItemsFromId = (id: string): void => {
        let index = cartItems.array.findIndex((cartItem)=>cartItem.item.id===id)
        let amountOfItems = cartItems.array[index].amount
        
        cartItems.removeValueByIndex(index)
        setAmountOfNumbersInCart(amountOfItemInCart-amountOfItems)
    }

    const removeOneItemFromId = (id: string): void => {
        let index = cartItems.array.findIndex((cartItem)=>cartItem.item.id===id)
        if(cartItems.array[index].amount<=1){
            cartItems.removeValueByIndex(index)
            setAmountOfNumbersInCart(amountOfItemInCart-1)
            return
        }
        cartItems.updateObjectByIndex(index, [{field: "amount", fieldValue: cartItems.array[index].amount-1}])
        setAmountOfNumbersInCart(amountOfItemInCart-1)
    }

    const clearCart = (): void => {
        cartItems.set([])
        setAmountOfNumbersInCart(0)
        localStorage.removeItem(CART_ITEMS)
    }

    return (
        <CartContext.Provider value={{cartItems: cartItems.array, amountOfItemInCart, totalPayment, 
            shopItemInfos: shopItemInfos.array, getInfoAboutItem}}>
            <CartUpdate.Provider value={{addItemToCart, removeAllItemsFromId, removeOneItemFromId, 
                    clearCart, addItemInfoToItems}}>
                {children}   
            </CartUpdate.Provider>
        </CartContext.Provider>
    )
}

export default CartProvider