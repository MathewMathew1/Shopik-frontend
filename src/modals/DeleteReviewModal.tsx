
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { SHOP_ITEM_REVIEWS_UPDATE } from '../helpers/routes';
import { useUpdateSnackbar } from '../contexts/SnackBarContext';
import { severityColors } from '../types/types';

const DeleteReviewModal = ({showModal, setShowModal, reviewId, removeReviewFromList}:
    {
        removeReviewFromList: () => void
        showModal: boolean, 
        setShowModal: React.Dispatch<React.SetStateAction<boolean>>
        reviewId: string|null
    }) => {
    const[reviewBeingPosted, setReviewBeingPosted] = useState(false)

    const controller = new AbortController()
    const snackbarUpdate = useUpdateSnackbar()

    const deleteReview = (): void => {
        if(reviewBeingPosted || reviewId === null) return
        
        setReviewBeingPosted(true)
        
        const { signal } = controller

        fetch(SHOP_ITEM_REVIEWS_UPDATE(reviewId),{
            method: "DELETE",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => {
                console.log(response)
                if(response.status === 204){
                    snackbarUpdate.addSnackBar({snackbarText: "Delete review successfully", severity: severityColors.success})
                    removeReviewFromList()
                    setShowModal(false)
                    return
                }
                snackbarUpdate.addSnackBar({snackbarText: "Unable to delete review", severity: severityColors.error})
                return
            })
            .finally(()=>setReviewBeingPosted(false))
            .catch(error=>{console.log({error})}) 
    }


    return (
        <Modal  show={showModal} onHide={()=>setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Are you sure, you want to delete your review on this product</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <div className='align-right'>
                    <ButtonGroup>
                        <Button variant='danger' onClick={() => deleteReview()} disabled={reviewBeingPosted}>
                            Delete
                        </Button>
                        <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    </ButtonGroup>
                </div>
            </Modal.Body>
            
        </Modal>
    )
}

export default DeleteReviewModal