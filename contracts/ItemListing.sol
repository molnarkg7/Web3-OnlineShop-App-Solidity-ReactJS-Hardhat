// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ItemListing {
    struct Product {
        uint256 itemId;
        address seller;
        uint256 price;
        string description;
        bool sold;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    event ProductListed(uint256 indexed itemId, address indexed seller, uint256 price, string description);
    event ProductSold(uint256 indexed itemId, address indexed buyer, uint256 price);

    function listProduct(uint256 _price, string memory _description) public {
        productCount++;
        require(!products[productCount].sold, "Product already sold");
        products[productCount] = Product(productCount, msg.sender, _price, _description, false);
        emit ProductListed(productCount, msg.sender, _price, _description);
    }

    function buyProduct(uint256 _itemId) public payable {
        require(_itemId > 0 && _itemId <= productCount, "Invalid item ID");
        Product storage product = products[_itemId];
        require(!product.sold, "Product already sold");
        require(msg.value >= product.price, "Insufficient funds");

        address payable seller = payable(product.seller);
        uint256 purchaseAmount = product.price;

        product.sold = true;
        seller.transfer(purchaseAmount);
        emit ProductSold(_itemId, msg.sender, purchaseAmount);
    }
}
