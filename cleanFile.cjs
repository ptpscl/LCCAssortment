const fs = require('fs');
let code = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

const brokenSection = `      </div>
        </>
      ) : (
        <PortfolioView data={portfolioData} expandedNodes={expandedNodes} onToggle={toggleNode} />
      )}
    </div>
  );
};`;

const fixedSection = `      </div>
    </div>
  );
};`;

code = code.replace(brokenSection, fixedSection);

// Now I need to add that logic to the actual end of CategoryDashboard, at line 998
const endBrokenSection = `    </div>
  );
}`;

const endFixedSection = `        </>
      ) : (
        <PortfolioView data={portfolioData} expandedNodes={expandedNodes} onToggle={toggleNode} />
      )}
    </div>
  );
}`;

// I'll replace the last match.
const lastIndex = code.lastIndexOf(endBrokenSection);
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + endFixedSection + code.substring(lastIndex + endBrokenSection.length);
}

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', code);
