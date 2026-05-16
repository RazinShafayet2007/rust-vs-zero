use std::hint::black_box;

fn main() {
    let src: [u8; 64] = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79, 82, 85, 88, 91, 94, 97, 100, 103, 106, 109, 112, 115, 118, 121, 124, 127, 130, 133, 136, 139, 142, 145, 148, 151, 154, 157, 160, 163, 166, 169, 172, 175, 178, 181, 184, 187, 190];
    let mut dst: [u8; 64] = [0; 64];
    let mut i: usize = 0;
    let mut total: u64 = 0;

    while i < 1_000_000 {
        let mut j: usize = 0;
        while j < 64 {
            dst[j] = black_box(src[j]);
            j += 1;
        }
        dst[i % 64] = (i % 251) as u8;
        total += dst[0] as u64 + dst[7] as u64 + dst[31] as u64 + dst[63] as u64;
        i += 1;
    }

    if total == 310_014_811 {
        println!("ok");
    } else {
        println!("bad");
    }
}
