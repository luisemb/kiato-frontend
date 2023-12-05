import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment";

export default {
    async getNotes(id) {
        const data = {
            token: localStorage.getItem('jwt'),
            userID: localStorage.getItem('id'),
            agentID: id
        }

        await axios
            .post('/api/getUserNotes', data)
            .then(response => {
                this.chatMessagesData = response.data;
                console.log(response);
            })
            .catch(error => {
                if (error.response) {

                    if(error.response.data.detail === 'Your session is expired!'){
                        this.$router.push('logout')
                    }

                    Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
                }
            })
    },
    formatDate: function (date, format) {
        date = moment(date).format(format)
        return date;
    },
    daysFromDate: function (date) {
        let days = ''
        days = moment(date).fromNow();
        return days;
    },
}