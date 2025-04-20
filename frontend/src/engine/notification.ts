export type notificationDocData = {
    licenseKey: string,
    uId: string,
    notificationID: string,
    title: string,
    body: string,
    tag: string,
    icon: string,
    when: number,
    fcmToken: string,
    sent: boolean
}

export type TTT_Notification = {
    id: string, //the same of the related event/todo/time tracker rule
    body: string,
    scheduleAt_timestamp: number,
    imagePath: string,
    tag: string, //type 
    title: string,
    fcmToken: string
}


export async function requestNotifyPermission(forceRequest = false): Promise<boolean> {
    const res = localStorage.getItem("notifyPermission")
    if (res != null && (!forceRequest || res === "granted")) {
        return res === "granted"
    } else {
        const permission = await Notification.requestPermission()
        localStorage.setItem("notifyPermission", permission)
        return permission == "granted"
    }
}