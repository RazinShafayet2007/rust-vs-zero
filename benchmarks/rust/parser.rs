use std::hint::black_box;

fn main() {
    let text = b"a1b2c3d4e5f6g7h8i9j0K_L-m+n/";
    let mut round: usize = 0;
    let mut total: u64 = 0;

    while round < 1_000_000 {
        let mut i: usize = 0;
        while i < text.len() {
            let b = black_box(text[i]);
            if b >= b'0' && b <= b'9' {
                total += 1;
            } else if (b >= b'A' && b <= b'Z') || (b >= b'a' && b <= b'z') {
                total += 2;
            } else {
                total += 3;
            }
            i += 1;
        }
        round += 1;
    }

    if total == 50_000_000 {
        println!("ok");
    } else {
        println!("bad");
    }
}
