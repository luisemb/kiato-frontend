<template>
  <div>
    <div ref="dropRef" class="dropzone custom-dropzone"></div>
    <div class="preview-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, defineComponent } from 'vue'
import { Dropzone } from 'dropzone'

export default defineComponent({
  name: 'uploadClients',
  setup() {

    const dropRef = ref(null)

    const customPreview = `
      <div class="column col-md-12" style="margin-top: 10px;margin-left: 20px;">
        <div class="row">
          <div class="col-md-6">
                <img data-dz-thumbnail/>
                <div className="dz-progress"><span className="dz-upload" data-dz-uploadprogress></span></div>
          </div>
          <div class="col-md-6">
                <div class="row">
                    <div class="dz-filename"><span data-dz-name></span></div>
                    <div className="dz-error-message"><span data-dz-errormessage></span></div>
                    <div className="dz-error-message"><span data-dz-errormessage></span></div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                          <div className="dz-success-mark"><span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/></svg></span></div>
                    </div>
                    <div class="col-md-3">
                          <div className="dz-error-mark"><span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-11.414L9.172 7.757 7.757 9.172 10.586 12l-2.829 2.828 1.415 1.415L12 13.414l2.828 2.829 1.415-1.415L13.414 12l2.829-2.828-1.415-1.415L12 10.586z"/></svg></span></div>
                    </div>
                    <div class="col-md-6"></div>
                </div>
          </div>
        </div>
      </div>
      <br>`

    onMounted(() => {
      if(dropRef.value !== null) {
        new Dropzone(dropRef.value, {
          previewTemplate: customPreview,
          url: 'http://localhost:3011/file/',
          method: 'POST',
          maxFilesize: 10000,
          maxFiles: 3,
          acceptedFiles: '.jpeg,.png,',
          previewsContainer: dropRef.value.parentElement.querySelector('.preview-container')
        })

        if(dropRef.value.querySelector('.dz-default')) {
          dropRef.value.querySelector('.dz-default').innerHTML = `
            <div style="display: flex; justify-content: center;">
              <svg width="3em" height="3em" viewBox="0 0 16 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">
                <path fill-rule="evenodd" d="m 8.0274054,0.49415269 a 5.53,5.53 0 0 0 -3.594,1.34200001 c -0.766,0.66 -1.321,1.52 -1.464,2.383 -1.676,0.37 -2.94199993,1.83 -2.94199993,3.593 0,2.048 1.70799993,3.6820003 3.78099993,3.6820003 h 8.9059996 c 1.815,0 3.313,-1.43 3.313,-3.2270003 0,-1.636 -1.242,-2.969 -2.834,-3.194 -0.243,-2.58 -2.476,-4.57900001 -5.1659996,-4.57900001 z m 2.3539996,5.14600001 -1.9999996,-2 a 0.5,0.5 0 0 0 -0.708,0 l -2,2 a 0.5006316,0.5006316 0 1 0 0.708,0.708 l 1.146,-1.147 v 3.793 a 0.5,0.5 0 0 0 1,0 v -3.793 l 1.146,1.147 a 0.5006316,0.5006316 0 0 0 0.7079996,-0.708 z"/>
              </svg>
            </div>
            <p style="text-align: center; margin: 0;"><strong>Drag and drop file to upload <br>(Or click Here)</strong></p>
            <p style="text-align: center; margin-top: 0;"><small style="color: #999;">Your file will be added automatically</small></p>
          `
        }
      }
    })

    return {
      dropRef
    }
  }
})
</script>

<style scoped>
.custom-dropzone {
  border-style: dashed;
  border-width: 3px;
  padding: 20px;
}

.preview-container {
  border: none;
  content: "";
  clear: both;
  display: table;
}

.column {
  float: left;
}
</style>
