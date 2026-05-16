use std::hint::black_box;

fn main() {
    let mut i: u64 = 0;
    let mut total: u64 = 0;

    while i < 30_000_000 {
        let value = black_box(i) % 7;
        if value == 0 {
            total += 3;
        } else if value == 1 || value == 2 {
            total += 5;
        } else {
            total += 1;
        }
        i += 1;
    }

    if total == 72_857_146 {
        println!("ok");
    } else {
        println!("bad");
    }
}
