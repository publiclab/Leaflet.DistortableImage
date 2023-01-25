let thumbnailFunc;
let imagesFunc;

export class Paginator {
  constructor(url, fetchedImages) {
    this.url = url;
    this.fetchedImages = fetchedImages;
    // number of images (thumbnails and fullres files) in response data
    this.count = this.fetchedImages.filter((file)=> { if (file.format === 'PNG' || file.format === 'JPEG' || file.format.includes('Thumb')) return file}).length;
    this.currPage = 0;
    this.imageThumbnails = this.fetchedImages.filter(file => file.source === 'derivative');
    this.fullResImages = this.fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG');
    this.nextBtn = document.getElementById('nextBtn');
    this.prevBtn = document.getElementById('prevBtn');
    this.runNextPageMethod = this.nextPage.bind(this);
    this.runPrevPageMethod = this.prevPage.bind(this);
    // next btn
    this.nextBtn.addEventListener('click', this.runNextPageMethod);
    // previous btn
    this.prevBtn.addEventListener('click', this.runPrevPageMethod);
  };


  paginate(images) {
    const imgsPerPage = 100;
    const pages = Math.ceil(images.length / imgsPerPage);
    const paginatedImages = Array.from({length: pages}, (_, index) => {
      const start = index * imgsPerPage;
      return images.slice(start, start + imgsPerPage);
    });
    return paginatedImages;
  };

  getRange() {
    const cntPerPage = 100; // amount of images per page
    const pageRange = [];
    let initPage;
    let endPage;
    let pageCount;

    // total number of images returned from fetch operation
    const totalImgCnt = this.getTotalImageCount();

    // when images are 99 or less
    if (totalImgCnt < cntPerPage) {
      initPage = 1;
      endPage = totalImgCnt;
      pageRange[0] = `${initPage} - ${endPage} of ${totalImgCnt}`;
    } else {
      const diff = totalImgCnt % cntPerPage;
      endPage = cntPerPage;
      let counter = 1;

      // when images paginate into exactly 100 per page
      if (diff === 0) {
        pageCount = totalImgCnt / cntPerPage;
        const i = pageCount;
        while (pageCount >= 1) {
          endPage = cntPerPage * counter;
          initPage = (endPage - cntPerPage) + 1;
          pageRange[i - pageCount] = `${initPage} - ${endPage} of ${totalImgCnt}`;

          --pageCount;
          ++counter;
        };
      } else {
      // when the last page has less than 100 images
        if (diff >= 1) {
          pageCount = Math.trunc(totalImgCnt / cntPerPage);
          let endPage = cntPerPage;
          const i = pageCount;

          while (pageCount >= 1) {
            endPage = cntPerPage * counter;
            initPage = (endPage - cntPerPage) + 1;
            pageRange[i-pageCount] = `${initPage} - ${endPage} of ${totalImgCnt}`;
            --pageCount;
            ++counter;
          };
          --counter;
          endPage = (cntPerPage * counter) + diff;
          initPage = (endPage - diff) + 1;
          pageRange[i - pageCount] = `${initPage} - ${endPage} of ${totalImgCnt}`;
        };
      };
    };

    return pageRange;
  };

  getTotalImageCount() {
    return this.fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG').length;
  };

  processImgs(renderThumbnails, renderImages) {
    thumbnailFunc = renderThumbnails;
    imagesFunc = renderImages;
    range.innerHTML = this.getRange()[this.currPage];

    if (this.count > 100) {
      if (this.imageThumbnails.length === this.fullResImages.length) {
        renderThumbnails(this.imageThumbnails, this.url, this.fullResImages);
      } else {
        renderThumbnails(false, this.url, this.fullResImages);
      }
    } else {
      renderImages(this.fullResImages, this.url);
    }
  };

  clear() {
    console.log('clear method ran');
    this.nextBtn.removeEventListener('click', this.runNextPageMethod);
    this.prevBtn.removeEventListener('click', this.runPrevPageMethod);
  };

  nextPage() {
    const pages = this.paginate(this.fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG')).length;
    if (this.currPage < pages) {
      this.currPage = this.currPage + 1;
    }

    if (this.currPage === pages) {
      this.currPage = 0;
    }
    imgContainer.textContent = '';

    this.processImgs(thumbnailFunc, imagesFunc);
  }

  prevPage() {
    const pages = this.paginate(this.fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG')).length;

    if (this.currPage) {
      this.currPage = this.currPage - 1;
    } else {
      this.currPage = pages - 1;
    }

    imgContainer.textContent = '';

    this.processImgs(thumbnailFunc, imagesFunc);
  }

  imagesForPage(images) {
    return this.paginate(images)[this.currPage];
  }
};
