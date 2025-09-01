import PortfolioProduct1 from "../../../../resources/UIBlocks/portfolioProducts/PortfolioProduct1";
import Button from "../../../../resources/components/button/Button";

function Product() {
  const product = [
    {
      image: "/assets/product/Cocopeat5kgBlock.webp",
      title: "Coco Peat 5KG Blocks",
      description:
        "Link Agro Exports provides the best Coco Peat in 5kg blocks, for horticulture & agriculture sectors. These Coco Peat Blocks are specially compressed for commercial greenhouses and Nurseries. This soil conditioner is suitable for all types of garden plants, lawns, flowers, orchids, bonsais and vegetables in pots or on the ground.",
      tables: [
        {
          title: "COCO PEAT 5KG BLOCK SPECIFICATION",
          // columns: ["Property", "Value"],
          data: [
            ["Size", "30 x 30 x14CM"],
            ["Weight", "4.5Kg-5.0Kg (+/-3%)"],
            [
              "Electrical Conductivity",
              "< 0.50 ms/cm (Washed)\n" + ">1.00 ms/cm (Unwashed)\n",
            ],
            ["pH Value", "5.8 – 6.8"],
            ["Water Holding", "15 litre per KG (Approx.)"],
          ],
        },
        {
          title: "COCO PEAT BLOCKS PACKING & SHIPMENT",
          columns: [
            "Compressed Block \n" + "Weight: 4.5Kg - 5Kg Blocks (+/-3%)\n",
            "Palletised:",
            "Non-palletised:",
          ],
          data: [
            [
              "Palletising ",
              "Blocks assembled in pallet and stretch wrapped",
              "Blocks assembled loose within the containter",
            ],
            [
              "Container Loadability",
              "240 Blocks/Pallet, 20pallets/40ft. | HQ Container (24MT)",
              "5200 Blocks/40ft. HQ Container (26 MT)",
            ],
          ],
        },
      ],
      note: "The sizes and packing details mentioned above are customizable on request.",
    },
    {
      image: "/assets/product/bb6501.webp",
      title: "COCO PEAT BRIQUETTE (650Grams)",
      description:
        "Link Agro Exports delivers Coco Peat Bricks which weighs 650 Grams. These bricks are applied in various processes like landscaping, seed rising, soil conditioning, potting mixes, etc., Coco Bricks are ideal for using hydroponic growing, potting media. We export Coco peat bricks in pallets or by wrapping individually with or without labels as per customer requirements.",
      tables: [
        {
          title: "COCO PEAT 650 GRAM BRIQUETTE SPECIFICATIONS",
          // columns: ["Property", "Value"],
          data: [
            ["Size", "20 x 10 x5CM"],
            ["Weight", "650g (+/-3%)"],
            [
              "Electrical Conductivity",
              "< 0.50 ms/cm (Washed)\n" + ">1.00 ms/cm (Unwashed)\n",
            ],
            ["pH Value", "5.8 – 6.8"],
            ["Water Holding", "10 – 11.5 per brick (Approx.)"],
          ],
        },
        {
          title: "COCO PEAT BRICKS PACKING & SHIPMENT",
          columns: [
            "Compressed Block \n" + "Weight: 4.5Kg - 5Kg Blocks (+/-3%)\n",
            "Palletised:",
            "Non-palletised:",
          ],
          data: [
            [
              "Palletising ",
              "Blocks assembled in pallet and stretch wrapped",
              "Blocks assembled loose within the containter",
            ],
            [
              "Container Loadability",
              "2000 Bricks (+/- 50)/Pallet, 20pallet / 40Ft HQ Container (24MT)",
              "Alternate Packing options like carton / bundle packing etc. as per client requirements.",
            ],
          ],
        },
      ],
      note: "The sizes and packing details mentioned above are customizable on request.",
    },
    {
      image: "/assets/product/Coco husk chips block 1.webp",
      title: "COCO HUSK CHIPS",
      description:
        "These compressed blocks of coconut Husk chips are widely used for growing roses and orchids in pots. We deliver these husk chips in various sizes weights and dimensions to fulfill the demands of different types of customers requirements.\n" +
        "Water holding capacity of husk chips makes this product irresistible to plant growth. And it also act as a mulch to maintain the soil conditions and prevents weed growth\n",
      tables: [
        {
          title: "COCO HUSK CHIPS BLOCKS PACKING & SHIPMENT",
          columns: [
            "Compressed Coco Husk chips Compressed Coco Husk chips  (+/-3%)\n",
            "Palletised:",
            "Non-palletised:",
          ],
          data: [
            [
              "Palletising ",
              "Blocks assembled in pallet and stretch wrapped",
              "Blocks assembled loose within the containter",
            ],
            [
              "Container Loadability",
              "240 Blocks/Pallet, 20pallets/40ft. | HQ Container (24MT)",
              "Alternate Packing options like carton / bundle packing etc. as per client requirements.",
            ],
          ],
        },
      ],
      note: "The sizes and packing details mentioned above are customizable on request.",
    },
    {
      image: "/assets/product/discs.webp",
      title: "COCOPEAT GROW BAGS & DISCS",
      description:
        "Link Agro Grow bags are offered in UV treated poly bags and these bags are available in various sizes and grades in a variety of porosity combinations, which allows water content to the plants on daily or periodical basis.\n" +
        "The seeds can be sown and grown directly in coco-peat grow bags. Pre-drilled holes are given in the upper surface of the grow bags to plant the seeds or seedling. Required numbers of drainage holes are made in grow bags for avoiding excessive water storage. Grow bags are more suitable for the plants that don’t grow long roots like cucumbers, chilly plants and tomatoes.",
      tables: [
        {
          title: "GROW BAGS SPECIFICATIONS",
          // columns: ["Property", "Value"],
          data: [
            ["Compressed Growbag Block Dimension", "100 x 18 x 4CM"],
            ["Dimension after Expansion", "100 x 18 x 16CM"],
            ["pH Value", "5.8 – 6.8"],
            ["Electrical Conductivity", "<0.5 ms/cm"],
            ["Water Holding", "55 Liters / bag (Approx)"],
            ["Compression ratio", "5:1"],
            ["Grow Bag", "Poly bag (UV treated) – upto 3 years"],
          ],
        },
        {
          title: "GROW BAG PACKING & SHIPMENT",
          // columns: ["Property", "Value"],
          data: [
            ["Grow bags in a 40ft Container", "7000bags (Approx)"],
            ["Number of Pallets in 40Ft container", "20 pallets"],
            ["Number of bags per pallet", "350 Approx"],
          ],
        },
      ],
      note: "Growbags size and dimension can be modified and manufactured as per client requirements",
    },
    {
      image: "/assets/product/CoirFiber.webp",
      title: "COCO COIR FIBER",
      description:
        "We deliver coir fiber which has enormous applications across various industries like mattress, erosion seating and packaging.  Fibers are naturally short, coarse, and extracted from the outer husk of the coconut. While comparing fibres with cotton and flax, fiber appears to be more lignin and less cellulose. We produce two types of coir fiber that are brown and white fibers.",
      tables: [
        {
          title: "Coir Fiber Specification and Shipment Packing",
          columns: ["DESCRIPTION", "COCO-COIR FIBER"],
          data: [
            ["Colour fiber", "White / Brown"],
            ["Impurity", "<5%"],
            ["Moisture", ", 15%"],
            [
              "Length of Fiber",
              "8-10CM Approx (20%) to 10 – 20CM Approx (80%)",
            ],
            ["Bale weight", "105Kg (+/-3kgs)"],
            ["Packing", "Steel Strap"],
            ["40Ft Container Loadability", "200 Bales"],
          ],
        },
      ],
    },
    {
      image: "/assets/product/5Kg block packing.webp",
      title: "PACKING",
      description: `Each product is securely compressed, wrapped, and loaded to
ensure maximum safety during transit.
We provide customizable packing formats including block stacking,
carton packing, and stretch wrapping.
Our efficient container loading methods maximize space without
compromising product integrity.
From bulk shipments to branded packaging, we ensure professional,
export-grade packing every time.`,
    },
  ];

  return (
    <div className="mt-20">
      <div className="relative h-[40vh] sm:h-[50vh] w-full">
        {/* Background Image */}
        <img
          src="/assets/IMG_8034[1].webp"
          alt="Sample"
          className="h-full w-full object-fit"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-foreground/70"></div>

        {/* Text Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="md:w-2/3 px-5 lg:px-[10%] text-background space-y-4">
            <h1 className="text-2xl lg:text-4xl font-bold animate__animated animate__fadeIn animate__fast">
              Our Premium Coco Peat Products
            </h1>
            <p className="text-sm lg:text-lg text-background/80 text-justify animate__animated animate__fadeIn animate__slow">
              Our involvement in the coconut and coconut fiber industry began
              when our ancestors farmed and harvested coconuts on their
              traditional farmland. We continue this ancestral legacy in the
              name of Link Agro Exports by modernizing to meet current global
              requirements. Now our facility is equipped to produce 5Kg cocopeat
              blocks both in low EC and high EC varieties. With several decades
              of experience, we are now capable of manufacturing and exporting
              cocopeat products worldwide.
            </p>
            <Button
              label="Contact Now"
              path="/contact"
              className="border border-ring/40 bg-primary hover:bg-hover"
            />
          </div>
        </div>
      </div>
      <div className="px-5 lg:px-[10%]">
        {product.map((item, index) => (
          <div key={index} className="">
            <div className="">
              <PortfolioProduct1 item={item} reverse={index % 2 === 0} />
            </div>
            {item.tables?.map((table, tIndex) => {
              return (
                <div key={tIndex} className={`my-10 animate__animated `}>
                  <h3 className="text-lg mb-2">{table.title}</h3>
                  <table className="w-full border border-ring/30">
                    {table.columns && table.columns.length > 0 && (
                      <thead>
                        <tr className="bg-primary text-background">
                          {table.columns.map((col, cIndex) => (
                            <th
                              key={cIndex}
                              className="px-4 py-2 text-left border border-ring/30"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {table.data.map((row, rIndex) => (
                        <tr key={rIndex} className="border border-ring/30">
                          {row.map((cell, cIndex) => (
                            <td
                              key={cIndex}
                              className="px-4 py-2 textra-sm border border-ring/30"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {item.note && (
              <div>
                <span className="font-bold">NOTE : </span>
                {item.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Product;
