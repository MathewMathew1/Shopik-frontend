import { ShopItemReview } from '../../types/types';
import { Star } from '../../helpers/Icons';
import { getDateFromOffset } from '../../helpers/functions';
import Badge from 'react-bootstrap/Badge';
import { useUser } from '../../contexts/UserContext';
import { Edit, Bin } from '../../helpers/Icons';

const Review = ({review, setShowUpdateModal, setShowDeleteModal}: {
        review: ShopItemReview, 
        setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>
        setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>
    }) => {

    const user = useUser()

    return(
        <div>
            {
                review.userId === user.userInfo?.id?
                    <div className='badge-group'>
                        <Badge pill bg="info">
                            Your Review
                        </Badge>
                        <span onClick={()=>setShowUpdateModal(true)} className='button-like-icon tooltipa'>
                            <Edit/>
                            <div className="tooltiptext">Edit</div>
                        </span>
                        <span onClick={()=>setShowDeleteModal(true)} className='button-like-icon tooltipa'>
                            <Bin/>
                            <div className="tooltiptext">Delete</div>
                        </span>
                    </div>
                :
                    null    
            }
       
            <div className='review-header'>
                
                    <div className="avatar-circle">{review.userSending?.username[0].toUpperCase()}</div>
                    {review.userSending? review.userSending.username: "Anonimyus"}
                    {review.rateFromUser!==undefined?
                        <div>
                            {[...Array(5)].map((e, i) => {
                                return (
                                    <span key={i}>
                                        <Star color={review.rateFromUser!.rate>i}/>
                                    </span>
                                )
                            })}
                        </div>
                        :
                        null
                    }
                    <div style={{flex: 1, paddingRight: "0.2rem"}} className='align-right'>
                        {getDateFromOffset(review.createdDate)}
                    </div>

            </div>
            <div className='text-align-left p-2'>
                {review.reviewText}
            </div>
        </div>
    )
}

export default Review