#include <iostream>
#include <fstream>
#include <string>

using namespace std;

int main(void) {
    string line;
    int j;
    for(int i = 1; i <= 10; i++) {
        ifstream input;
        ofstream output;
        
        input.open ("8500User" + to_string(i) + "_outputs.dat");
        output.open ("8500User" + to_string(i) + "_parsed.dat");
        j = 1;
        while ( getline (input,line) )
        {
            if(j != 1) {
                output << ',';
            }
            output << line;
            j++;
        }
        output.close();
        input.close();
    }
    return 0;
}
