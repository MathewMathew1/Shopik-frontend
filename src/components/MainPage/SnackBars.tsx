//HELPERS
import { useSnackbar, useUpdateSnackbar } from "../../contexts/SnackBarContext";
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
//TYPES
import { SnackbarInfo } from "../../contexts/SnackBarContext"

const SnackBars = (): JSX.Element => {
    const snackBars = useSnackbar()
    const snackBarUpdate = useUpdateSnackbar()

    const removeSnackBar = (index: number) => {
        snackBarUpdate.removeSnackBarByIndex(index)
    }

    return(
        <div>
            <ToastContainer style={{zIndex: "16", paddingBottom: "5rem"}}  position="bottom-end" containerPosition="fixed" >
                {snackBars.snackBarsInfos.map((snackbar: SnackbarInfo, index: number)=> (
                    <Toast key={`Toast ${index}`} style={{backgroundColor: snackbar.severity, position: "sticky", zIndex: "15"}}  
                        onClose={() => removeSnackBar(index)} delay={5000} autohide >
                        <Toast.Header>{snackbar.message}</Toast.Header>
                        
                    </Toast>
                ))}
            </ToastContainer>
        </div>

  
    )
}

export default SnackBars;