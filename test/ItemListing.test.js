const { expect } = require("chai");

describe("ItemListing", function () {
  let ItemListing;
  let itemListing;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    ItemListing = await ethers.getContractFactory("ItemListing");
    [owner, addr1, addr2] = await ethers.getSigners();

    itemListing = await ItemListing.deploy();
    await itemListing.deployed();
  });

  describe("listProduct", function () {
    it("should add a product to the list", async function () {
      const price = ethers.utils.parseEther("1.0");
      const description = "Test Product";

      await itemListing.listProduct(price, description);

      const productCount = await itemListing.productCount();
      const product = await itemListing.products(productCount);

      expect(product.itemId).to.equal(productCount);
      expect(product.seller).to.equal(owner.address);
      expect(product.price).to.equal(price);
      expect(product.description).to.equal(description);
      expect(product.sold).to.equal(false);
    });

    it("should revert if the item ID is invalid", async function () {
      await expect(
        itemListing.connect(addr1).buyProduct(0, { value: 0 })
      ).to.be.revertedWith("Invalid item ID");
    });

    it("should revert if the product is already sold", async function () {
      const price = ethers.utils.parseEther("1.0");
      const description = "Test Product";

      await itemListing.listProduct(price, description);

      const productCount = await itemListing.productCount();
      const product = await itemListing.products(productCount);

      await itemListing.connect(addr1).buyProduct(product.itemId, {
        value: price,
      });

      await expect(
        itemListing.connect(addr2).buyProduct(product.itemId, { value: price })
      ).to.be.revertedWith("Product already sold");
    });

    it("should revert if the funds sent are insufficient", async function () {
      const price = ethers.utils.parseEther("1.0");
      const description = "Test Product";

      await itemListing.listProduct(price, description);

      const productCount = await itemListing.productCount();
      const product = await itemListing.products(productCount);

      await expect(
        itemListing.connect(addr1).buyProduct(product.itemId, { value: 0 })
      ).to.be.revertedWith("Insufficient funds");
    });
  });
});
