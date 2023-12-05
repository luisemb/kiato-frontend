<script>
import DropZone from "@/components/widgets/dropZone";

export default {
  name: 'attachments',
  components: {
    DropZone
  },
}
</script>
<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">Upload Zone</h5>
    </div>
    <div class="card-body">
      <div class="mb-4">
        <h5 class="fs-14 mb-1">Upload File</h5>
        <p class="text-muted">Select manually</p>
        <input
            class="form-control"
            id="product-image-input"
            type="file"
            accept="image/png, image/gif, image/jpeg"
        />
      </div>
      <div>
        <h5 class="fs-14 mb-1">.CSV Files Only</h5>
        <p class="text-muted">Add Your CSV File.</p>
        <DropZone @drop.prevent="drop" @change="selectedFile" />

        <div
            class="border rounded"
            v-for="(file, index) of files"
            :key="index"
        >
          <div class="d-flex p-2">
            <div class="flex-grow-1">
              <div class="pt-1">
                <h5 class="fs-14 mb-1" data-dz-name="">
                  {{ file.name }}
                </h5>
                <p class="fs-13 text-muted mb-0" data-dz-size="">
                  <strong>{{ file.size / 1024 }}</strong> KB
                </p>
                <strong
                    class="error text-danger"
                    data-dz-errormessage=""
                ></strong>
              </div>
            </div>
            <div class="flex-shrink-0 ms-3">
              <button
                  data-dz-remove=""
                  class="btn btn-sm btn-danger"
                  @click="deleteRecord"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- end card -->
</template>