
class Box {
    static int size = 7;
    public static void main(String[] args) {
        for(int i = 0; i < size; i++) {
            for(int j = 0; j < size; j++) {
                if (i == 0 || i == (size-1)) { // horizontal edges
                    System.out.print("*");
                } else if( j == 0 || j == (size-1)) { // vertical edges
                    System.out.print("*");
                } else if (j==i || j==(size-1-i)) {
                    System.out.print("*");
                } else {
                    System.out.print(" ");
                }
            }
            System.out.print("\n");
        }
    }
}
