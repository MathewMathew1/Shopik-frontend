
import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import AutoTextArea from '../smallComponents/AutoTextArea';
import { SHOP_ITEM_REVIEWS_POST, SHOP_ITEM_REVIEWS_UPDATE } from '../helpers/routes';
import { useUpdateSnackbar } from '../contexts/SnackBarContext';
import { severityColors } from '../types/types';
import { useParams } from 'react-router-dom';

const ReviewModal = ({showModal, setShowModal, updatingReview, oldReviewText, reviewId, updateUserReview}:
    {
        showModal: boolean, 
        setShowModal: React.Dispatch<React.SetStateAction<boolean>>
        updatingReview: boolean,
        oldReviewText: string,
        reviewId?: string|null,
        updateUserReview: (updatedText: string) => void
    }) => {
    const[reviewText, setReviewText] = useState("")
    const[reviewBeingPosted, setReviewBeingPosted] = useState(false)
    const params = useParams()

    const controller = new AbortController()
    const snackbarUpdate = useUpdateSnackbar()
    
    useEffect(() => {
        setReviewText(oldReviewText)
    }, [oldReviewText]);
    
    const reviewProduct = (): void => {
        if(reviewBeingPosted || params.id === undefined) return
        
        setReviewBeingPosted(true)
        
        const body = {
            "ReviewText": reviewText
        }
        
        const { signal } = controller

        fetch(SHOP_ITEM_REVIEWS_POST(params.id),{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(!response.errors){
                    const snackBarInfo = {message: "Posted Review successfully", severity: severityColors.success}
                    sessionStorage.setItem("snackbar", JSON.stringify(snackBarInfo))
                    snackbarUpdate.addSnackBar({snackbarText: "Posted Review successfully", severity: severityColors.success})
                    
                    setReviewText("")
                    setShowModal(false)
                    window.location.reload()
                    return
                }
                snackbarUpdate.addSnackBar({snackbarText: "Unable to post review", severity: severityColors.error})
                return
            })
            .finally(()=>setReviewBeingPosted(false))
            .catch(error=>{console.log({error})})
    }

    const updateReview = (): void => {
        if(reviewBeingPosted || reviewId === undefined || reviewId ===null) return
        
        setReviewBeingPosted(true)
        
        const body = {
            "ReviewText": reviewText
        }
        
        const { signal } = controller

        fetch(SHOP_ITEM_REVIEWS_UPDATE(reviewId),{
            method: "PATCH",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => {
                console.log(response)
                if(response.status === 204){
                    snackbarUpdate.addSnackBar({snackbarText: "Updated review successfully", severity: severityColors.success})
                    updateUserReview(reviewText)
                    setReviewText("")
                    setShowModal(false)
                    return
                }
                snackbarUpdate.addSnackBar({snackbarText: "Unable to update review", severity: severityColors.error})
                return
            })
            .finally(()=>setReviewBeingPosted(false))
            .catch(error=>{console.log({error})}) 
    }

    const handleButtonClick = () => {
        if(updatingReview){
            updateReview()
            return
        }
        reviewProduct()
    }

    useEffect(() => {
        return () => {
            controller.abort()
        }  
    }, []);

    return (
        <Modal  show={showModal} onHide={()=>setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Write Your Review</Modal.Title>
            </Modal.Header>
            <Modal.Body >
               
                <AutoTextArea text={reviewText} setText={setReviewText} title={"Review"}></AutoTextArea>
                <div className='align-right margin-top-sm'>
                    <ButtonGroup>
                        <Button onClick={() => handleButtonClick()} disabled={reviewBeingPosted}>
                            {   
                                updatingReview?
                                    <>Update</>
                                :
                                    <>Post</>
                            }
                        </Button>
                        <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    </ButtonGroup>
                </div>
            </Modal.Body>
            
        </Modal>
    )
}

export default ReviewModal