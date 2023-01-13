export class Paginator {
  constructor(url, count, fetchedImages, handleNext, handlePrev) {
    this.url = url;
    this.count = count;
    this.fetchedImages = fetchedImages;
    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrev);
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

  processImgs(renderThumbnails, renderImages, count, currPage) {
    const imageThumbnails = this.fetchedImages.filter(file => file.source === 'derivative');
    const fullResImages = this.fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG');
    range.innerHTML = this.getRange()[currPage];

    if (count > 100) {
      if (imageThumbnails.length === fullResImages.length) {
        renderThumbnails(imageThumbnails, this.url, fullResImages);
      } else {
        renderThumbnails(false, this.url, fullResImages);
      }
    } else {
      renderImages(fullResImages, this.url);
    }
  };

  clear(handleNext, handlePrev) {
    nextBtn.removeEventListener('click', handleNext);
    prevBtn.removeEventListener('click', handlePrev);
  };

  nextPage(currPage, imageContainer) {
    const pages = this.paginate(this.fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG')).length;

    if (currPage < pages) {
      currPage = currPage + 1;
    }

    if (currPage === pages) {
      currPage = 0;
    }
    imageContainer.textContent = '';

    return currPage;
  };

  prevPage(currPage, imageContainer) {
    const pages = this.paginate(this.fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG')).length;

    if (currPage) {
      currPage = currPage - 1;
    } else {
      currPage = pages - 1;
    }
    imageContainer.textContent = '';
    return currPage;
  }
};
