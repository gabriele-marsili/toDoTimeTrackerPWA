export type notificationDocData = {
    licenseKey: string,
    uId: string,
    notificationID: string,
    title: string,
    body: string,
    tag: string,
    icon: string,
    when: Date,
    fcmToken: string,
    sent: boolean
}

export type TTT_Notification = {
    id: string, //the same of the related event/todo/time tracker rule
    body: string,
    scheduleAt_timestamp: Date,
    imagePath: string,
    tag: string, //type 
    title: string,
    fcmToken: string
}


export async function requestNotifyPermission(forceRequest = false): Promise<boolean> {
    try {

        const res = localStorage.getItem("notifyPermission")
        if (res != null && (!forceRequest || res === "granted")) {
            return res === "granted"
        } else {            
            const permission = await Notification.requestPermission()
            localStorage.setItem("notifyPermission", permission)
            return permission == "granted"
        }
    } catch (error) {
        console.log("error in request notify permission:\n",error)
        return false;
    }
}