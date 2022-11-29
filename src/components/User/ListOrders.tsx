import { Order} from "../../types/types";
import { SHOP_ORDER_GET } from "../../helpers/routes";
import { useEffect, useState } from "react";
import OrderNotCompleted from "./OrderNotCompleted";
import OrderCompleted from "./OrderCompleted copy";
import { Spinner } from "react-bootstrap";

const DisplayOrders = ({orders, loaded}:{orders: Order[], loaded: boolean}) => {
    return(
        <>
            {
                loaded?
                    <>
                        {orders.length>0?
                            <>
                                {orders.map((value, index) => {
                                    return(
                                        <OrderNotCompleted order={value} />
                                    )
                                })}
                            </>
                            :
                                <div>
                                    <h4> No Incoming orders</h4>
                                </div>    
                        }
                    </>
                : 
                <div className='centered' >
                    <Spinner animation="border" variant="primary" style={{height: "10rem", width: "10rem"}} />
                </div> 
            }
        </>
    )
}

const DisplayCompleted = ({orders, loaded}:{orders: Order[], loaded: boolean}) => {
    return(
        <>
            {
                loaded?
                    <>
                        {orders?.length>0?
                            <>
                                {orders.map((value, index) => {
                                    return(
                                        <OrderCompleted order={value} />
                                    )
                                })}
                            </>
                            :
                                <div>
                                    <h4> No completed orders</h4>
                                </div>
                        }
                    </>
                : 
                <div className='centered' >
                    <Spinner animation="border" variant="primary" style={{height: "10rem", width: "10rem"}} />
                </div> 
            }
        </>
    )
}


const ListOrders = () => {
    const[ordersNotCompleted, setOrdersNotCompleted] = useState<{orders: Order[], loaded: boolean}>({orders: [], loaded: false })
    const[ordersCompleted, setOrdersCompleted] = useState<{orders: Order[], loaded: boolean}>({orders: [], loaded: false })
    const[showCompleted, setShowCompleted] = useState(false)
    const controller = new AbortController()

    useEffect(() => {

        document.title = `Shopik User Orders` 

        const { signal } = controller
      
        fetch(SHOP_ORDER_GET(false),{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if(!response.error){
                    let orders: Order[] = response.orders
                    orders.forEach(order => {
                        order.orderedItems.forEach(orderedItem => {
                            let item = order.items.find(x=>x.id===orderedItem.shopItemId)
                            if(item!==undefined)   orderedItem.item = item
                        })
                    })
                    setOrdersNotCompleted({orders: orders, loaded: true})
                    return
                }
                setOrdersNotCompleted({orders: [], loaded: true})
            })
            .catch(error=>{console.log(error)})
        
        fetch(SHOP_ORDER_GET(true),{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if(!response.error){
                    let orders: Order[] = response.orders
                    orders.forEach(order => {
                        order.orderedItems.forEach(orderedItem => {
                            let item = order.items.find(x=>x.id===orderedItem.shopItemId)
                            if(item!==undefined)   orderedItem.item = item
                        })
                    })
                    setOrdersCompleted({orders: orders, loaded: true})
                    return
                }
                setOrdersCompleted({orders: [], loaded: false})
            })
            .catch(error=>{console.log(error)})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div>
            <h3>Orders</h3>
            <div className="tabs">
                <button onClick={()=>setShowCompleted(false)} className={`tab-button ${showCompleted? "": "current-tab"}`} >Orders Incoming</button>
                <button onClick={()=>setShowCompleted(true)} className={`tab-button ${showCompleted? "current-tab": "" }`} >Orders Completed</button>
            </div>
            {
                showCompleted?
                    <DisplayCompleted orders={ordersCompleted.orders} loaded={ordersCompleted.loaded}/>
                :
                    <DisplayOrders orders={ordersNotCompleted.orders} loaded={ordersNotCompleted.loaded}/>    
            }
        </div>
    );
}

export default ListOrders;