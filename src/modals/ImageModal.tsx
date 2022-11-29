
import Modal from 'react-bootstrap/Modal';

const ImageModal = ({title, imageLink, showModal, setShowModal}:
    {title: string, imageLink: string, showModal: boolean, setShowModal: React.Dispatch<React.SetStateAction<boolean>>}) => {
    return (
        <Modal style={{marginLeft: 0, width: "80%", height: "auto", maxHeight: "100%"}} show={showModal} onHide={()=>setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{width: "100%"}}>
                <img width={"100%"} src={imageLink} alt={title}></img>
            </Modal.Body>

        </Modal>
    )
}

export {ImageModal}