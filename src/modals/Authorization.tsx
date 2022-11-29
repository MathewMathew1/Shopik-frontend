import { useState, useReducer, useEffect } from 'react';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '../helpers/routes';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import CSS from 'csstype';
import InputGroup from 'react-bootstrap/InputGroup';
import { useUpdateSnackbar } from '../contexts/SnackBarContext';
import { severityColors } from '../types/types';
import { useUser, useUserUpdate } from '../contexts/UserContext';

const ICON_STYLE: CSS.Properties = {
    width: "6rem",
    height: "6rem",
    
};

const BUTTON_TEXT = {
    LOGIN: "Login",
    SIGN_UP: "Sign up"
}

const LENGTH = {
    MINIMUM_PASSWORD: 8,
    MINIMUM_USERNAME: 3,
    MAXIMUM_USERNAME: 32,
}

const ERRORS = {
    USERNAME_TAKEN: "Username already taken",
    USERNAME_TO_SHORT: `Username must be at least ${LENGTH.MINIMUM_USERNAME} characters`,
    USERNAME_TO_LONG: `Username must be less than ${LENGTH.MAXIMUM_USERNAME} characters`,
    PASSWORD_TO_SHORT: `Password must be at least ${LENGTH.MINIMUM_PASSWORD} characters`,
    PASSWORD_DOESNT_MATCH: "Passwords doesn't match",
    PASSWORD_TOO_WEAK: "Passwords too weak",
    INCORRECT_CREDENTIALS: "Incorrect username or password",
}  

export {ERRORS as authorizationErrors, LENGTH as authorizationStandard}

const ACTIONS = {
    USERNAME_ERROR: "usernameError",
    PASSWORD_ERROR: "passwordError",
    PASSWORD_ERROR2: "passwordError2",
}  

const formErrorsReducer = (state: any, action: any) => {
    switch(action.type){
        case ACTIONS.USERNAME_ERROR:
            return {
                ...state,
                "usernameError": action.payload.error
            }
        case ACTIONS.PASSWORD_ERROR:
            return {
                ...state,
                "passwordError": action.payload.error
            }
        case ACTIONS.PASSWORD_ERROR2:  
            return {
                ...state,
                "passwordError2": action.payload.error
            }
        default:
            return state      
    }
}



const Authorization = (): 
    JSX.Element => {

    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const [username, setUsername] = useState("")
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const [hidePassword, setHidePassword] = useState({password: true, password2: true})

    const [formErrors, dispatchFormErrors] = useReducer(formErrorsReducer, {passwordError: "", usernameError: "", passwordError2: "" })
    const controller = new AbortController()
    
    const user = useUser()
    const userUpdate = useUserUpdate()

    const snackBarUpdate = useUpdateSnackbar()
    
    const authorizeUser = (): void =>{
        cleanErrors()
        if(isFormSubmitted) return

        setIsFormSubmitted(true)
        
        if(user.isLoginModalOpen) loginUser()
        else signUpUser()
       
    }

    const cleanErrors = (): void => {
        dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: ""} })
        dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR2, payload: {error: ""} })
        dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: ""} })
    }
    
    const signUpUser = async () => {

        let anyError: boolean = false
        if(password.length<LENGTH.MINIMUM_PASSWORD){ 
            dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: ERRORS.PASSWORD_TO_SHORT} })
            anyError = true
        }    
        if(username.length<LENGTH.MINIMUM_USERNAME) {
            dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: ERRORS.USERNAME_TO_SHORT} })
            anyError = true
        }    
        if(username.length>LENGTH.MAXIMUM_USERNAME){ 
            dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: ERRORS.USERNAME_TO_LONG} })
            anyError = true
        }
        if(password !== password2){
            dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR2, payload: {error: ERRORS.PASSWORD_DOESNT_MATCH} })
            anyError = true
        }

       if(anyError) return

        const { signal } = controller

        const body = {
            "username": username,
            "password": password
        }

        fetch(SIGNUP_ROUTE(),{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => {
                console.log( response)
                if(response.status===204){
                    userUpdate.setIsLoginModalOpen(true)
                    snackBarUpdate.addSnackBar({snackbarText: "Sign up successfully", severity: severityColors.success})
                    clearData()
                    
                    return response
                }
                return response.json()
            })
            .then(response => {            
                if(!response.error) {
                    userUpdate.setIsLoginModalOpen(true)
                    return
                }
                if(response.error.includes("Username")){
                    dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: response.error} })
                }
                if(response.error.includes("Password")){
                    dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: response.error} })
                }

                return  
            })
            .finally(()=>{setIsFormSubmitted(false)})
            .catch(error=>{console.log(error)})
        
    }

    const loginUser = (): void => {

        const body = {
            "username": username,
            "password": password
        }
        
        const { signal } = controller
        fetch(LOGIN_ROUTE(),{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => response.json())
            .then(response => {       
                if(!("error" in response)){
                    userUpdate.setIsAuthModalOpen(false)
                    localStorage.setItem("token", response.accessToken)
                    const snackBarInfo = {message: "Login successfully", severity: severityColors.success}
                    sessionStorage.setItem("snackbar", JSON.stringify(snackBarInfo))
                    if(user.redirectUrlAfterLogin!==null){
                        window.location.replace(`/${user.redirectUrlAfterLogin}`)
                    }
                    else{
                        window.location.reload()
                    }
                    return
                }
                if(response.error.includes("Username")){
                    dispatchFormErrors({ type: ACTIONS.USERNAME_ERROR, payload: {error: response.error} })
                }
                if(response.error.includes("Password")){
                    dispatchFormErrors({ type: ACTIONS.PASSWORD_ERROR, payload: {error: response.error} })
                }
                return
            })
            .finally(()=>setIsFormSubmitted(false))
            .catch(error=>{console.log({error})})
    }

    const openDifferentModal = (): void => {
        clearData()
        userUpdate.setIsLoginModalOpen(!user.isLoginModalOpen)
    }

    const clearData = (): void => {
        setUsername("")
        setPassword("")
        setPassword2("")
        cleanErrors()
        setHidePassword({password: true, password2: true})
    }


    useEffect(() => {
   
        return () => {
            controller.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

    return (
        <Modal show={user.isAuthModalOpen} onHide={()=>userUpdate.setIsAuthModalOpen(false)}>
        <Modal.Header >
            <Modal.Title className='center_element'>
                <svg style={ICON_STYLE} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" value={username}
                        placeholder="Enter Username" onChange={(e)=>setUsername(e.target.value)} />
                    {formErrors.usernameError?

                        <Form.Text className="text-muted">
                            <Alert variant='danger'>{formErrors.usernameError}</Alert>
                        </Form.Text>
                        :null    
                    }
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                        <InputGroup >
                            <Form.Control type={hidePassword.password? 'password': "text"} value={password}
                                placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
                            <InputGroup.Text onClick={()=>setHidePassword({...hidePassword, password: !hidePassword.password})} id="basic-addon1" className='div-button'>
                                <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                </svg>
                            </InputGroup.Text>
                            
                        </InputGroup>
                        {formErrors.passwordError?
                            <Form.Text className="text-muted">
                                <Alert variant='danger'>{formErrors.passwordError}</Alert>
                            </Form.Text>
                            :null    
                        }
                </Form.Group>
                {!user.isLoginModalOpen?
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Repeat Password</Form.Label>
                        <InputGroup >
                            <Form.Control type={hidePassword.password2? 'password': "text"} placeholder="Repeat Password" 
                                onChange={(e)=>setPassword2(e.target.value)} value={password2} />
                            <InputGroup.Text onClick={()=>setHidePassword({...hidePassword, password2: !hidePassword.password2})} id="basic-addon1" className='div-button'>
                                <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                </svg>
                            </InputGroup.Text>
                        </InputGroup>
                        {formErrors.passwordError2?
                            <Form.Text className="text-muted">
                                <Alert variant='danger'>{formErrors.passwordError2}</Alert>
                            </Form.Text>
                            :null    
                        }
                    </Form.Group>
                    :null
                }
                
                <div className='align-right margin-right-sm margin-top-sm'>
                    <Button disabled={isFormSubmitted} variant="primary"  onClick={()=>authorizeUser()}>
                        {user.isLoginModalOpen? 
                            <>{BUTTON_TEXT.LOGIN}</>
                            :
                            <>{BUTTON_TEXT.SIGN_UP}</>
                        }
                    </Button>
                
                    {user.isLoginModalOpen?
                        <div className='small-text'>If you don't have account yet, sign up 	&nbsp;
                            <span className='button-link' onClick={()=>openDifferentModal()}>here</span>
                        </div>
                    :
                        <div className='small-text'>If you have account already, login 	&nbsp;
                            <span className='button-link' onClick={()=>openDifferentModal()}>here</span>
                        </div>
                    }
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer>    
        </Modal.Footer>
      </Modal>
        
 
  );
}

export default Authorization;