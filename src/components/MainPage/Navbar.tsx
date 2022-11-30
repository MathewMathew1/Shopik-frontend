import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useUser, useUserUpdate } from '../../contexts/UserContext';
import { Cart } from '../../helpers/Icons';
import { Button } from 'react-bootstrap';
import Authorization from '../../modals/Authorization';
import { useSearchParams } from 'react-router-dom';
import { useCart} from '../../contexts/CartContext';
import { Link } from "react-router-dom";
import { useEffect } from 'react';
import { useUpdateSnackbar } from '../../contexts/SnackBarContext';
import { severityColors } from '../../types/types';

const TRANSACTION_SUCCESS_VALUES = {
    cartRemove: {
        key: "clearCart",
        value: "clear"
    },
    transaction: {
        key: "transaction",
        value: "success"
    }
}

export {TRANSACTION_SUCCESS_VALUES}

const NavbarComponent = () => {
    const user = useUser()
    const userUpdate = useUserUpdate()
    const cart = useCart()
    const snackbarUpdate = useUpdateSnackbar()

    const [searchParam] = useSearchParams()

    useEffect(() => {
        let transaction = searchParam.get(TRANSACTION_SUCCESS_VALUES.transaction.key)

        if(transaction===TRANSACTION_SUCCESS_VALUES.transaction.value){
            snackbarUpdate.addSnackBar({snackbarText: "Successfully ordered items", severity: severityColors.success})

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand style={{fontFamily:"Brush Script MT", fontSize: "1.4rem"}} as={Link} to="/">Shopik</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse style={{flexGrow: 0}}>
                        <Nav className="me-auto justify-content-end ">
                            <Nav.Link as={Link} to="/cardItems">
                               
                                    <div className='badge-holder'>
                                        <Cart/>
                                        {
                                            cart.amountOfItemInCart>0?
                                                <span className='badge'>{cart.amountOfItemInCart}</span>
                                            :
                                                null
                                        } 
                                    </div>
                               
                            </Nav.Link>            
                            {
                                user.logged?
                                    <NavDropdown title={
                                        <div className="avatar-circle">{user.userInfo?.username[0].toUpperCase()}</div>
                                        } id="basic-nav-dropdown">
                                        <NavDropdown.Item >{user.userInfo?.username}</NavDropdown.Item>
                                        <hr/>
                                        <NavDropdown.Item as={Link} to="/user/orders" >Orders</NavDropdown.Item>
                                        <NavDropdown.Item onClick={() => userUpdate.logout()}>Logout</NavDropdown.Item>
                                    </NavDropdown>
                                :
                                <Button onClick={()=>userUpdate.setIsAuthModalOpen(true)}>Login</Button>
                            }
                            </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Authorization />
        </>
    );
}

export default NavbarComponent;