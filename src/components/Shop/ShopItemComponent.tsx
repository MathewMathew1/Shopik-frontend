import { RoleEnum, severityColors, ShopItem, ShopItemReview } from '../../types/types';
import { useState, useEffect } from 'react';
import { SHOP_ITEM_ROUTE, SHOP_ITEM_REVIEWS, SHOP_ITEM_RATING } from '../../helpers/routes';
import { useNavigate, useParams } from "react-router-dom"
import Spinner from 'react-bootstrap/Spinner';
import { Button } from 'react-bootstrap';
import { getDateFromOffset } from '../../helpers/functions';
import useArray from '../../customHooks/useArray';
import Review from '../Review/Review';
import { capitalizedString } from '../../helpers/functions';
import { Star } from '../../helpers/Icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { ImageModal } from '../../modals/ImageModal';
import { useUser, useUserUpdate } from '../../contexts/UserContext';
import { useUpdateSnackbar } from '../../contexts/SnackBarContext';
import ReviewModal from '../../modals/ReviewModal';
import DeleteReviewModal from '../../modals/DeleteReviewModal';
import { useCart, useUpdateCart } from '../../contexts/CartContext';
import { Link } from "react-router-dom";
import Magnifier from '../../smallComponents/Magnifier';

const ReviewR: ShopItemReview = {
    id: "1",
    userId: "5",
    reviewText: "Good and fast delivery, item was excelent condition,Good and fast delivery, item was excelent conditionand fast delivery, item was excelent condition,Good and fast deliveryand fast delivery, item was excelent condition,Good and fast deliveryand fast delivery, item was excelent condition,Good and fast delivery",
    createdDate: "2022-09-27T11:38:00.8997127+00:00",
    shopItemId: "5",
    userSending: {
        username: "Molah",
        role: RoleEnum.Admin,
        createdDate: "2022-09-27T11:38:00.8997127+00:00"
    },
    rateFromUser: {
        rate: 3,
        createDate: "2022-09-27T11:38:00.8997127+00:00"
    }
}

const ShopItemComponent = () => {
    const [shopItem, setShopItem] = useState<ShopItem>()
    const shopItemReviews = useArray<ShopItemReview>([])
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    const [numberOfItemsToBuy, setNumbersOfItemsToBuy] = useState("1")
    const [showImageModal, setShowImageModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false)
    const [userPostedReviewAlready, setUserPostedReviewAlready] = useState(true)
    const [textToStartWritingReview, setTextToStartWritingReview] = useState("")
    const [userReviewId, setUserReviewId] = useState<null|string>(null)

    const cart = useCart()
    const cartUpdate = useUpdateCart()
    let navigate = useNavigate();
    
    const [[x, y], setXY] = useState([0, 0]);
    const [[imgWidth, imgHeight], setSize] = useState([0, 0])
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [amountOfStarsToHighlight, setAmountOfStarsToHighlight] = useState(5)

    const params = useParams()

    const controller = new AbortController()
    const user = useUser()
    const updateCart = useUpdateCart()
    const userUpdate = useUserUpdate()
    const snackbarUpdate = useUpdateSnackbar()

    useEffect(() => {
        const fetchItem = async () => {
            setShowImageModal(false)
            if(typeof(params.id)!=="string") return
            
            setIsDataLoaded(false)
            let item = await cart.getInfoAboutItem(params.id)
            if(item!==null){
                item.name = capitalizedString(item.name)
                setShopItem(item)
                document.title = `Shopik ${item.name}`
            }
            setIsDataLoaded(true)
        }

        const fetchReviews = async () => {
            const { signal } = controller
            if(params.id===undefined) return

            fetch(SHOP_ITEM_REVIEWS(params.id),{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                }})
                .then(response => response.json())
                .then(response => {
                    
    
                    console.log(response)
                    if(!("error" in response)){
                        let reviews: ShopItemReview[] = [ReviewR,ReviewR,ReviewR,ReviewR,...response.reviews]
                        const index = reviews.findIndex((review) => review.userId === user.userInfo?.id);
                        if(index !== -1) { 
                            const updatedReviews = [...reviews];
                            updatedReviews.unshift(...updatedReviews.splice(index, 1));
                            shopItemReviews.set(updatedReviews)
                            setUserReviewId(updatedReviews[0].id)
                            setTextToStartWritingReview(updatedReviews[0].reviewText)
                            return
                        };
                        setUserPostedReviewAlready(false)
                        shopItemReviews.set(reviews)
                        return         
                    }
                })
                .finally()
                .catch(error=>{console.log(error)})
        }

        fetchItem()
        fetchReviews()

        return () => {
            controller.abort()
        }    
    }, [params.Id]);

    const removeReviewFromList = () => {
        if(userReviewId==null) return
        
        shopItemReviews.removeByKey("id", userReviewId)
        setUserPostedReviewAlready(false)
        setTextToStartWritingReview("")
        setUserReviewId(null)
    }

    const updateUserReview = (updatedText: string) => {
        if(userReviewId==null) return
        
        shopItemReviews.updateObjectByKey("id", userReviewId, [{field: "reviewText", fieldValue: updatedText}])
    }

    const updateMagnifier = (e: React.MouseEvent<HTMLImageElement, MouseEvent>): void => {
        const elem = e.currentTarget;
        const { width, height } = elem.getBoundingClientRect();
        setSize([width, height]);
        setShowMagnifier(true);
    }

    const updateMagnifierPosition = (e: React.MouseEvent<HTMLImageElement, MouseEvent>): void => {
        const elem = e.currentTarget;
        const { top, left } = elem.getBoundingClientRect();

        // calculate cursor position on the image
        const x = e.pageX - left - window.pageXOffset;
        const y = e.pageY - top - window.pageYOffset;

        setXY([x, y]);
    }

    const rateProduct = (numberOfStars: number): void => {
        const body = {
            "Rate": numberOfStars
          }
        
        const { signal } = controller

        fetch(SHOP_ITEM_RATING(shopItem?.id? shopItem.id: "id"),{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => {
                console.log(response.status)
                if(response.status === 200){
                    snackbarUpdate.addSnackBar({snackbarText: "Rated product successfully", severity: severityColors.success})
                    return
                }
                snackbarUpdate.addSnackBar({snackbarText: "Unable to rate movie", severity: severityColors.error})
            })
            .catch(error=>{console.log({error})})
    }

    useEffect(() => {
        if(user.userInfo?.id != null){
            const index: number = shopItemReviews.findIndexByKey("userId", user.userInfo?.id);
            if(index !== -1) { 
                const updatedReviews = [...shopItemReviews.array];
                updatedReviews.unshift(...updatedReviews.splice(index, 1));
                shopItemReviews.set(updatedReviews)
                setTextToStartWritingReview(updatedReviews[0].reviewText)
                setUserPostedReviewAlready(true)
                setUserReviewId(updatedReviews[0].id)
                return
            };
        }
    }, [user.userInfo?.id, shopItemReviews.array.length]);

    const postReview = () => {
        if(user.logged){
            setShowReviewModal(true)
            return
        }
        userUpdate.setIsLoginModalOpen(true)
        userUpdate.setIsAuthModalOpen(true)
    } 

    const buyItem = () => {
        if(shopItem===undefined) return

        const checkoutUrl = `/payment?id=${shopItem?.id}&cartItems=false&amount=${numberOfItemsToBuy}`
        cartUpdate.addItemInfoToItems(shopItem)
        navigate(checkoutUrl)
    }

    

    return(
        <>
            {!isDataLoaded?
                <div className='centered' >
                    <Spinner animation="border" variant="primary" style={{height: "10rem", width: "10rem"}} />
                </div>
            :
                <>
                    {!shopItem?
                        <div style={{fontSize: "24px", fontWeight: "bold"}}>This item doesn't exist</div>
                        :
                        <div>
                            <div className='shop_item_container'>
                            
                                <div className='shop-item-image' onClick={()=>setShowImageModal(true)}>
                                    <div style={{position: "relative", display: "inline-block"}}>
                                        <img alt={shopItem?.name} className='shop-item-image' 
                                            style={{maxHeight: "400px"}}
                                            onMouseEnter={(e) => updateMagnifier(e)}
                                            onMouseMove={(e) => updateMagnifierPosition(e)}
                                            onMouseLeave={() => setShowMagnifier(false)}
                                            src={shopItem.imageFilePath}>
                                        </img>
                                        <Magnifier y={y} x={x} showMagnifier={showMagnifier} imageUrl={shopItem.imageFilePath} imgHeight={imgHeight}
                                            imgWidth={imgWidth}/>
                                    </div>
                                </div>
                                <div className='description-area'>
                                    <h3>{shopItem?.name}</h3>
                                    <div className='info-block'>
                                        <div className='info-header'>Product Info:</div>
                                        <div className='Info'>
                                            {shopItem?.description}
                                        </div>
                                    </div>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td className='title-td'>Price:</td>
                                                <td className='info-td'>{shopItem?.price}$</td>
                                            </tr>
                                            <tr>
                                                <td className='title-td'>Season:</td>
                                                <td className='info-td'>{shopItem?.season}</td>
                                            </tr>
                                            <tr >
                                                <td className='title-td'>Ratings:</td>
                                                <td className='info-td'>{shopItem?.averageRating!==null? shopItem?.averageRating: 0}/5
                                                ({shopItem?.amountOfRatings!==null? shopItem?.amountOfRatings: 0})</td>
                                            </tr>
                                            <tr >
                                                <td className='title-td'>In Sales Since:</td>
                                                <td className='info-td'>{getDateFromOffset(shopItem!.createdDate)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className='order-area'>
                                    <h4>{shopItem?.price}$</h4>
                                    <div ><span className='highlight-text'>Free delivery</span> </div>
                                    <div>Max delivery time is 3 days</div>
                                    <div>
                                        Amount:
                                        <select value={numberOfItemsToBuy} aria-label="Default select example" 
                                            onChange={(e)=>setNumbersOfItemsToBuy(e.target.value)} className="small-selector">
                                
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        
                                        </select>
                                    </div>
                                    <div className="margin-top-bg flex-column">
                                        <Button onClick={()=>updateCart.addItemToCart(shopItem, parseInt(numberOfItemsToBuy))} className='rounded-button'>Add to Card</Button>
                                        <Button variant="info" className='rounded-button' onClick={()=>buyItem()}>Buy</Button>
                                    </div>
                                </div>
                                <div className='rating-area'>
                                    <h4>Rating of this product</h4>
                                    <div style={{fontWeight: "bold", justifyContent: "center", alignItems: "center", padding: "0.4rem"}}>
                                        {[...Array(5)].map((e, i) => {
                                            return (
                                                <span key={i}>
                                                    <Star color={shopItem!.averageRating>i}/>
                                                </span>
                                            )
                                        })}
                                        {shopItem?.averageRating!==null? shopItem?.averageRating: 0}/5
                                                ({shopItem?.amountOfRatings!==null? shopItem?.amountOfRatings: 0})
                                    </div>
                                    <div>
                                        {[...Array(5)].map((e, i) => {
                                            return (
                                                <div style={{display: "flex", gap: "1rem", alignItems: "baseline"}} key={i}>
                                                    <div className="mini-header">{i+1} stars</div>
                                                
                                                    <ProgressBar style={{flexGrow: "1"}} now={((i+1)/15)*100} label={`${Math.round(((i+1)/15)*100)}%`} />
                                                    
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className='margin-top-bg'>
                                        {user.logged?
                                            <div onMouseLeave={()=>setAmountOfStarsToHighlight(5)}>
                                                Rate this product:
                                                {[...Array(5)].map((e, i) => {
                                                    return (
                                                        <span  key={i} onMouseEnter={()=>setAmountOfStarsToHighlight(i+1)} onClick={()=> rateProduct(i+1)}>
                                                        <Star  color={amountOfStarsToHighlight>i}/>
                                                        </span>
                                                    )
                                                })}                              
                                            </div>
                                            :
                                            <div> You need to be logged to rate this product, 
                                            <span className='button-link' onClick={()=>userUpdate.setIsAuthModalOpen(true)}>login</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div  className='reviews-area'>
                                    <div className='flex baseline' >
                                        <h4 className='text-align-left'>Reviews:</h4> 
                                        {shopItemReviews.array.length >0 && !userPostedReviewAlready?
                                                <div style={{marginLeft: "auto"}} className='text-align-right'>
                                                    Write your own <span className='button-link' onClick={()=>postReview()}>review</span> 
                                                </div>
                                            :
                                                null
                                        }
                                    </div>                          
                                    {shopItemReviews.array.length >0?
                                        <div className='reviews'>
                                        
                                            {shopItemReviews.array.map((value, index) => {
                                                return(
                                                    <Review setShowUpdateModal={setShowReviewModal} setShowDeleteModal={setShowDeleteReviewModal} key={index} review={value}/>
                                                )
                                            })}
                                        </div>
                                        :
                                        <div>
                                            No reviews on this item, be the first to <span className='button-link' onClick={()=>postReview()}>review</span> it
                                        </div>
                                    }
                                </div>                 
                            </div>
                            <ImageModal title={shopItem!.name} showModal={showImageModal} setShowModal={setShowImageModal}
                                imageLink={"https://media.cntraveler.com/photos/60088d408ebb4b589a89b54e/master/w_2100,h_1500,c_limit/LightweightJackets-2021-Uniqlo.jpg"}/>
                            <ReviewModal showModal={showReviewModal} setShowModal={setShowReviewModal} updatingReview={userPostedReviewAlready}
                                oldReviewText={textToStartWritingReview} reviewId={userReviewId} updateUserReview={updateUserReview} />  
                            <DeleteReviewModal showModal={showDeleteReviewModal} setShowModal={setShowDeleteReviewModal}
                                reviewId={userReviewId} removeReviewFromList={removeReviewFromList}/>
                              
                        </div>
                    }   
                </>
            }
        </>
    )
}

export default ShopItemComponent