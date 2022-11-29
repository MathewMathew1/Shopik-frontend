import useArray from '../../customHooks/useArray';
import { CartItem, severityColors, ShopItem } from '../../types/types';
import { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import Table from 'react-bootstrap/Table';
import { Alert, Button, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { SHOP_ORDER_POST, SITE_ROUTE_URL } from '../../helpers/routes';
import ShopItemInTable from './ShopItemInTable';
import { QuestionMark } from '../../helpers/Icons';
import ListGroup from 'react-bootstrap/ListGroup';
import { useUpdateSnackbar } from '../../contexts/SnackBarContext';
import { TRANSACTION_SUCCESS_VALUES } from '../MainPage/Navbar';



const LENGTH = {
    MINIMUM_ZIPCODE: 3,
    MAXIMUM_ZIPCODE: 12,
    MINIMUM_COUNTRY: 2,
    MINIMUM_CITY: 2,
}

const ERRORS = {
    ZIPCODE_TO_SHORT: `Zipcode must be at least ${LENGTH.MINIMUM_ZIPCODE} characters`,
    ZIPCODE_TO_LONG: `Zipcode must be less than ${LENGTH.MINIMUM_ZIPCODE} characters`,
    COUNTRY_TO_SHORT: `Country must be at least ${LENGTH.MINIMUM_COUNTRY} characters`,
    REGION_EMPTY: `Region field cannot be empty`,
    ADDRESS_EMPTY: `Address field cannot be empty`,
    CITY_TO_SHORT: `City must be at least ${LENGTH.MINIMUM_CITY} characters`,
}  

const Payment = () => {
    const cart = useCart()
    const [searchParams, setSearchParams] = useSearchParams();
    const [addCartItems, setAddCartItems] = useState(false)
    const [requestSend, setRequestSend] = useState(false)
    const [cityData, setCityData] = useState<{city: string, error: null|string}>({city: "", error: null});
    const [countryData, setCountryData] = useState<{country: string, error: null|string}>({country: "", error: null});
    const [postalCodeData, setPostalCodeData] = useState<{postalCode: string, error: null|string}>({postalCode: "", error: null});
    const [regionData, setRegionData] = useState<{region: string, error: null|string}>({region: "", error: null});
    const [addressData, setAddressData] = useState<{address: string, error: null|string}>({address: "", error: null});

    const shopItemsToBuy = useArray<CartItem>([])
    
    const snackbarUpdate = useUpdateSnackbar()

    const controller = new AbortController()
 
    const checkAddCartItems = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddCartItems(e.target.checked)
        if(e.target.checked){
            searchParams.set("cartItems", "true")
            setSearchParams(searchParams)
            return
        }
        searchParams.set("cartItems", "false")
        setSearchParams(searchParams)
        
    }

    useEffect(() => {
        let param = searchParams.get("cartItems")
        if(param==="true") setAddCartItems(true)
        document.title = `Shopik Payment`

        const checkItemInParam = async () => {
            const itemId = searchParams.get("id")
            const amount = searchParams.get("amount")

            if(itemId==null || amount==null) return
                
            const amountNumber = parseInt(amount)
            
            if(Number.isNaN(amountNumber)) return
            

            const itemInfo: ShopItem|null = await cart.getInfoAboutItem(itemId)

            if(itemInfo===null) return

            shopItemsToBuy.push({amount: amountNumber, item: itemInfo})

        }

        checkItemInParam() 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const changeRegion = (region: string) => {
        var error: null|string = null
        if(region.length===0) error = ERRORS.REGION_EMPTY

        setRegionData({region, error: error})

        return error===null
    }

    const changeCity = (city: string) => {
        var error: null|string = null
        if(city.length<LENGTH.MINIMUM_CITY) error = ERRORS.CITY_TO_SHORT

        setCityData({city, error: error})

        return error===null
    }

    const changePostalCode = (postalCode: string) => {
        var error: null|string = null
        if(postalCode.length>LENGTH.MAXIMUM_ZIPCODE) error = ERRORS.ZIPCODE_TO_LONG

        if(postalCode.length<LENGTH.MINIMUM_ZIPCODE) error = ERRORS.ZIPCODE_TO_SHORT
    

        setPostalCodeData({postalCode, error: error})

        return error===null
    }

    const changeAddress = (address: string) => {
        var error: null|string = null
        if(address.length===0)error = ERRORS.ADDRESS_EMPTY

        setAddressData({address: address,error: error})

        return error===null
    }

    const changeCountry = (country: string) => {
        var error: null|string = null
        if(country.length<LENGTH.MINIMUM_COUNTRY) error = ERRORS.COUNTRY_TO_SHORT

        setCountryData({country: country, error: error})

        return error===null
    }


    const order = (): void => {
        let anyError = false

        if(cityData.city.length<LENGTH.MINIMUM_CITY){
            anyError = true
            setCityData(cityData => {
                return {...cityData, error: ERRORS.CITY_TO_SHORT}
            })
        }
        if(postalCodeData.postalCode.length>LENGTH.MAXIMUM_ZIPCODE){
            anyError = true
            setPostalCodeData(postalCode => {
                return {...postalCode, error: ERRORS.ZIPCODE_TO_LONG}
            })
        }
        if(postalCodeData.postalCode.length<LENGTH.MINIMUM_ZIPCODE){
            anyError = true
            setPostalCodeData(postalCode => {
                return {...postalCode, error: ERRORS.ZIPCODE_TO_SHORT}
            })
        }
        if(addressData.address.length===0){
            anyError = true
            setAddressData(addressData => {
                return {...addressData, error: ERRORS.ADDRESS_EMPTY}
            })
        }
        if(regionData.region.length===0){
            anyError = true
            setRegionData(regionData => {
                return {...regionData, error: ERRORS.REGION_EMPTY}
            })
        }
        if(countryData.country.length<LENGTH.MINIMUM_COUNTRY){
            anyError = true
            setCountryData(countryData => {
                return {...countryData, error: ERRORS.COUNTRY_TO_SHORT}
            })
        }

        if(anyError) return

        setRequestSend(true)
        const { signal } = controller

        const orderedItems = shopItemsToBuy.array.map(item=> {
            return {
                 "ShopItemId": item.item.id,
                 "Amount": item.amount
            }
        })

        if(addCartItems){
            cart.cartItems.forEach((cartItem)=> {
                let index = orderedItems.findIndex(item => item.ShopItemId === cartItem.item.id)
                if(index===-1){
                    let orderedItem = {
                        "ShopItemId": cartItem.item.id,
                        "Amount": cartItem.amount
                    }
    
                    orderedItems.push(orderedItem)
                    return
                }
                orderedItems[index].Amount +=  cartItem.amount          
            })
        }
      

        const {transaction, cartRemove} = TRANSACTION_SUCCESS_VALUES

        const cartUrlParam = addCartItems? `&${cartRemove.key}=${cartRemove.value}`: ""

        const body = {
            "Address": addressData.address,
            "Country": countryData.country,
            "PostalCode": postalCodeData.postalCode,
            "Regions": regionData.region,
            "City": cityData.city,
            "OrderedItems": orderedItems,
            "RedirectUrlSuccess": `${SITE_ROUTE_URL}?${transaction.key}=${transaction.value}${cartUrlParam}`,
            "RedirectUrlFailure": window.location.href
        }

        fetch(SHOP_ORDER_POST(),{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if(!response.error && response.url !==undefined){
                    window.location.href = response.url
                }
                else{
                    snackbarUpdate.addSnackBar({snackbarText: "Unable to create transaction, try again", severity: severityColors.error})
                }
       
                setRequestSend(false)
                
            })
            .catch(error=>{console.log({error})})
    }

    const isThereAnyItemInCheckout = shopItemsToBuy.array.length > 0 || (addCartItems && cart.cartItems.length > 0)

    const totalPrize = () => {
        let prize 
        prize = shopItemsToBuy.array.reduce((previousValue: number, current: CartItem) => previousValue + (current.amount*current.item.price), 0)

        if(addCartItems){
            let prizeFromCartItems = cart.cartItems.reduce((previousValue: number, current: CartItem) => previousValue + (current.amount*current.item.price), 0)
            prize += prizeFromCartItems
        }

        return prize
    }

    return(
        <div className='margin-top-bg'>       
            <h3> Payment: </h3>
            <div className='flex-column'>
                <Form onSubmit={()=>order()}>
                    <div className='shipping-flex'>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Country</Form.Label>
                            <Form.Control value={countryData.country} onChange={(e)=>changeCountry(e.target.value)} type="text" placeholder="Enter country" />
                            {countryData.error!==null?
                                    <Alert key={"error country"} variant={"danger"}>{countryData.error}</Alert>
                                :
                                    null
                            }
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPostalCode">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control value={postalCodeData.postalCode} onChange={(e)=>changePostalCode(e.target.value)} type="text" placeholder="Enter Postal Code" />
                            {postalCodeData.error!==null?
                                    <Alert key={"error postalCode"} variant={"danger"}>{postalCodeData.error}</Alert>
                                :
                                    null
                            }
                        </Form.Group>
                  
                        <Form.Group className="mb-3" controlId="formBasicRegion">
                            <Form.Label>Region</Form.Label>
                            <Form.Control value={regionData.region} onChange={(e)=>changeRegion(e.target.value)} type="text" placeholder="Enter Region" />
                            {regionData.error!==null?
                                    <Alert key={"error region"} variant={"danger"}>{regionData.error}</Alert>
                                :
                                    null
                            }
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicCity">
                            <Form.Label>City</Form.Label>
                            <Form.Control value={cityData.city} onChange={(e)=>changeCity(e.target.value)} type="text" placeholder="Enter City" />
                            {cityData.error!==null?
                                    <Alert key={"error city"} variant={"danger"}>{cityData.error}</Alert>
                                :
                                    null
                            }
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicAddress">
                            <Form.Label>Address</Form.Label>
                            <Form.Control value={addressData.address} onChange={(e)=>changeAddress(e.target.value)} type="text" placeholder="Enter Address" />
                            {addressData.error!==null?
                                    <Alert key={"error address"} variant={"danger"}>{addressData.error}</Alert>
                                :
                                    null
                            }
                        </Form.Group>
                   
                    </div>
                    <div style={{display: "flex", justifyContent: "center"}} key={`default`} >
                        <Form.Check
                            checked={addCartItems}
                            onChange={(e)=>checkAddCartItems(e)} 
                            reverse
                            type={"checkbox"}
                            id={`default-radio`}
                            label={`Add Card Items`}
                        />                  
                    </div>
                </Form>
            </div>
            <div className='margin-top-bg'>
                <h4> Total Prize: {totalPrize()}</h4>
                <Button onClick={()=>order()} disabled={!isThereAnyItemInCheckout||requestSend}>Buy</Button>
                <span className='tooltipa m-2'>
                    <QuestionMark/>
                    <div className="tooltiptext t-center wide-tooltip">
                        Since it is demo app :
                        <ListGroup as="ol">
                            <ListGroup.Item>In card number insert repeating 42</ListGroup.Item>
                            <ListGroup.Item>In email field insert any email</ListGroup.Item>
                            <ListGroup.Item>In expiration day any future date</ListGroup.Item>
                            <ListGroup.Item>In other fields anything</ListGroup.Item>
                        </ListGroup>
                    </div>
                </span>        
            </div>           
            {
                isThereAnyItemInCheckout?
                    <div className='payment-area'>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>About</th>
                                    <th>Amount</th>
                                    <th>Price</th>
                                    <th>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>                                
                                {shopItemsToBuy.array.map((value, index) => {
                                    return(
                                        <ShopItemInTable key={`item ${index}`} index={index} shopItem={value}/>
                                    )
                                })}
                                {
                                    addCartItems?
                                        <>
                                            {cart.cartItems.map((value, index) => {
                                                return(
                                                    <ShopItemInTable key={`cartitem ${index}`} index={index} shopItem={value}/>
                                                )
                                            })}
                                        </>
                                    :
                                        null
                                }
                            </tbody>
                        
                        </Table>
                    </div>  
                :
                    <h5>No items selected to buy</h5>
            }
        </div>
    )
}

export default Payment