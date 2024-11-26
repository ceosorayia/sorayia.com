import React from "react";
import ButtonFilled from "../ButtonFilled/ButtonFilled";
import styles from "./HeroShowcase.module.css";
import BrandsContainer from "./BrandsContainer/BrandsContainer";
import Link from "next/link";

const HeroShowcase = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.text}> START to invest in $SRA</p>
        <div className={styles.buttonContainer}>
          <Link href={'/buyToken'}>
          <ButtonFilled text={"BUY$SRA"} />
          </Link>
          <Link href={'/staking'}>
          <ButtonFilled text={"STAKE$SRA"} />
          </Link>
        </div>
      </div>

      <BrandsContainer />

      {/* <div className={styles.imagesSection}>
        <div className={styles.imageContainer2}>
          <Image
            src={"/images/mobile.png"}
            width={250}
            height={504}
            alt="mobile"
            className={styles.image2}
          />
        </div>
        <div className={styles.imageContainer3}>
          <Image
            src={"/images/screen.jpeg"}
            width={830}
            height={525}
            alt="mobile"
            className={styles.image3}
          />
        </div>
        <div className={styles.elipse1}></div>
        <div className={styles.elipse2}></div>
      </div> */}
    </div>
  );
};

export default HeroShowcase;
