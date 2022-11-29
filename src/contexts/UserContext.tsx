import  {useState, createContext, useContext, useEffect} from "react";
import { severityColors, UserInfo } from "../types/types";
import { USER_DATA_ROUTE } from "../helpers/routes";


type UserContextProps = {    
    logged: boolean; 
    fetchingUserDataFinished: boolean;
    userInfo: UserInfo|undefined;
    isAuthModalOpen: boolean,
    isLoginModalOpen: boolean,
    redirectUrlAfterLogin: string|null
}

type UserUpdateContextProps = {  
    logout: () => void
    setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setRedirectUrlAfterLogin: React.Dispatch<React.SetStateAction<string | null>>
    setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}    

const UserContext = createContext({} as UserContextProps)
const UserUpdate = createContext({} as UserUpdateContextProps)


export function useUser(){
    return useContext(UserContext)
}

export function useUserUpdate(){
    return useContext(UserUpdate)
}

const UserProvider = ({ children }: {children: React.ReactNode}): JSX.Element => {
    const [logged, setLogged] = useState(false)
    const [userInfo, setUserInfo] = useState<UserInfo>()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(true)
    const [redirectUrlAfterLogin, setRedirectUrlAfterLogin] = useState<string|null>(null)
    const [fetchingUserDataFinished, setFetchingUserDataFinished] = useState(false)
    
    const controller = new AbortController()

    const fetchAllData = async (): Promise<void> => {
        if(!localStorage.getItem("token")) {
            setFetchingUserDataFinished(true)
            return
        }
        
        const { signal } = controller
        await fetch(USER_DATA_ROUTE(),{
            method: "GET",
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': "Bearer " + localStorage.getItem("token") || ""
            }})
            .then(response => response.json())
            .then(response => {
                if(!("error" in response || response.status===401)){
                    setLogged(true)
                    setUserInfo(response.userInfo)           
                }
            })
            .catch(error=>{console.log(error)})    
        
        setFetchingUserDataFinished(true)
    }


    useEffect(() => {
        fetchAllData()

        return () => {
            controller.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const logout = (): void => {
        setLogged(false)
        localStorage.removeItem("token")
        setUserInfo(undefined)
        const snackBarInfo = {message: "Logout successfully", severity: severityColors.success}
        sessionStorage.setItem("snackbar", JSON.stringify(snackBarInfo))
        window.location.replace("/")
    }

    return (
        <UserContext.Provider value={{logged, fetchingUserDataFinished, userInfo, isAuthModalOpen, isLoginModalOpen, redirectUrlAfterLogin}}>
            <UserUpdate.Provider value={{logout, setIsAuthModalOpen, setIsLoginModalOpen, setRedirectUrlAfterLogin}}>
                {children}   
            </UserUpdate.Provider>
        </UserContext.Provider>
    )
}

export default UserProvider