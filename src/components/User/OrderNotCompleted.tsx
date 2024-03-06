import { getDateFromOffset } from "../../helpers/functions";
import { Order } from "../../types/types";

const OrderNotCompleted = ({order}:{order: Order}) => {

    return (
        <div className="order-report">
           <div>OrderID </div> <div>{order.id}</div>
           <div>Expected Delivery Time </div><div>{getDateFromOffset(order.expectedDeliveryTime)}</div>
           <div>Address </div><div>{order.address}</div>
           <div>Items</div>
           <div> 
                {order.orderedItems.map((value, index) => {
                    return(
                        <div key={`${index} item`}>{value.amount} {value.item.name}</div>
                    )
                })} 
            </div>
        </div>
    );
}

export default OrderNotCompleted;