import { useEffect, useState } from 'react';
import { useCart, useUpdateCart } from '../../contexts/CartContext';
import Table from 'react-bootstrap/Table';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useUser, useUserUpdate } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
    
    const cart = useCart()
    const updateCart = useUpdateCart()
    const user = useUser()
    const updateUser = useUserUpdate()
    let navigate = useNavigate();

    const proceedToPayment = (): void => {

        if(!user.logged){
            updateUser.setRedirectUrlAfterLogin("payment?cartItems=true")
            updateUser.setIsLoginModalOpen(true)
            updateUser.setIsAuthModalOpen(true)
            return
        }

        navigate(`/payment?cartItems=true`)
    }

    useEffect(() => {
        document.title = `Shopik Cart`    
    }, []);

    return(
        <div >       
            <h3>Your Cart:</h3>
            {
                cart.amountOfItemInCart ===0 ?
                    <div>
                        No items in your inventory so far
                    </div>
                :
                    <div className='cart-container'>
                        <div className='table-group'>
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>About</th>
                                        <th>Actions</th>
                                        <th>Amount</th>
                                        <th>Price</th>
                                        <th>Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.cartItems.map((value, index) => {
                                        return(
                                            <tr key={`${index} table`}>
                                                <td><img src={value.item.imageFilePath} alt="12313" height="100px"></img></td>
                                                <td className='description-table' style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                                    <a href={`/ShopItem/${value.item.id}`} style={{display: "block"}} className='info-header'>{value.item.name}</a>
                                                    <span >{value.item.description}</span>

                                                </td>
                                                <td>
                                                    <ButtonGroup>
                                                        <Button onClick={()=>updateCart.removeAllItemsFromId(value.item.id)} variant='danger'>Remove All</Button>
                                                        <Button onClick={()=>updateCart.removeOneItemFromId(value.item.id)} variant='warning'>Remove One</Button>
                                                    </ButtonGroup>
                                                </td>
                                                <td>{value.amount}</td>
                                                <td className='info-header'>{value.item.price}$</td>
                                                <td className='info-header'>{value.item.price * value.amount}$</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                    
                            </Table>
                        </div>
                        <div className='payment-group'>
                            <h3>Total Payment: {cart.totalPayment}$</h3>
                            <ButtonGroup>
                                <Button onClick={()=>proceedToPayment()} variant='info'>Buy all</Button>
                            </ButtonGroup>
                            <div className='small-text'>delivery in up two days</div>
                        </div>
                    </div>
            }
        </div>
    )
}

export default CartItems