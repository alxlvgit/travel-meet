// Get api keys from server
const getSecretKeys = async () => {
    try {
        const response = await fetch('/secretKeys', {
            method: 'GET'
        })
        const data = await response.json();
        if (data) {
            return JSON.parse(data);
        } else {
            console.log("Something went wrong");
        }
    }
    catch (error) {
        console.log(error);
    }
}